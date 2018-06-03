'use strict';

var async = require('async');
var moment = require('moment');

module.exports = (sequelize, DataTypes) => {
	var comment = sequelize.define('comment', {
		text: DataTypes.TEXT,
		children: {
			type: DataTypes.VIRTUAL
		},
		score: DataTypes.VIRTUAL,
		upvotes: DataTypes.VIRTUAL,
		downvotes: DataTypes.VIRTUAL,
		remainingChildren: DataTypes.VIRTUAL,
		createdAtFormatted: {
			type: DataTypes.VIRTUAL,
			get: function() {
				return moment(this.createdAt, 'YYYY-MM-DDTHH:mm', false).format('MMMM Do, YYYY hh:mma');
			}
		}
	}, {});
	comment.associate = function (models) {
		// associations can be defined here
		models.comment.hasMany(models.commentvote, { onDelete: 'cascade', hooks: true });
		models.comment.belongsTo(models.user);
		models.comment.belongsTo(models.post);
		models.comment.belongsTo(models.comment, {
			as: 'parent',
			foreignKey: 'parentId' // we need to specify the column name since its an association with itself
		});
	};
	
	comment.settings = {
		maxPerPage: 4
	}

	comment.getComments = async function(post, parent = undefined, noLimit = false, user = undefined, page = undefined) {

		// var limit = (parent > 0) ? 999:2;

		// If the limit isn't overriden and there is a parent, we must be getting only the chilren comments, so get 2 comments
		// If the limit is overriden (i.e. we are expanding the children comments) or there is no parent, we must be getting the roots OR the fully expanded children set
		var limit = (parent > 0 && noLimit === false) ? 2 : (parent === undefined) ? comment.settings.maxPerPage : 5000;
		var offset = page !== undefined ? page * comment.settings.maxPerPage : 0;

		return new Promise((resolve, reject) => {
			let sql = 'SELECT\
				c.createdAt,\
				c.postId,\
				c.id AS id,\
				c.text,\
				u.username,\
				u.id AS userId,\
				v.upVotes,\
				v.downVotes,\
				(v.upVotes - v.downVotes) AS totalVotes,\
				v.score,\
				uv.value AS userVote,\
				p.id AS parent\
			FROM comments c\
			INNER JOIN users u ON u.id = c.userId\
			LEFT JOIN (\
			SELECT commentId, \
				upVotes, \
				downVotes,\
				((upVotes + 1.9208) /(upVotes + downVotes) - 1.96 * SQRT((upVotes * downVotes) /(upVotes + downVotes) + 0.9604) /(upVotes + downVotes)) /(1 + 3.8416 /(upVotes + downVotes)) AS score\
				FROM (\
					SELECT commentId, \
					COUNT(CASE WHEN value=1 THEN 1 ELSE NULL END) as upVotes,\
					COUNT(CASE WHEN value=-1 THEN 1 ELSE NULL END) as downVotes\
					FROM commentvotes GROUP BY commentId\
				) x GROUP BY commentId    \
			) v ON v.commentId = c.id\
			LEFT JOIN commentvotes uv ON uv.commentId = c.id AND uv.userId ' + ((user === undefined) ? ('IS NULL') : ('= ' + ('' + user))) + '\
			LEFT JOIN comments p ON c.parentId = p.id\
			WHERE c.parentId ' + ((parent === undefined) ? ('IS NULL') : ('= ' + ('' + parent))) + ' \
			AND c.postId = ' + (post) + '\
			ORDER BY v.score DESC\
			LIMIT ' + ('' + limit) + ' OFFSET ' + ('' + offset) + ';';

			sequelize.query(sql, { model: sequelize.models.comment }).then(comments => {
				resolve(comments);
			}).catch(error => {
				reject(error);
			});
		});
	} 

	// Get the immediate children
	comment.prototype.getChildren = async function(user) {
		return new Promise((resolve, reject) => {
			// Get comments where parent is this ID, with a limit of 2
			sequelize.models.comment.getComments(this.postId, this.id, false, user).then(async (children) => {
				let total_count = await sequelize.models.comment.count({where: {parentId: this.id}});
				this.remainingChildren = total_count - children.length;
				resolve(children);	
			}).catch(error => {
				reject(error); console.log(error);
			});
		});
	}

	// Recursively expand the children to get a full tree of comment hierarchy
	comment.prototype.expandChildren = async function(user = undefined) {
		// Quick explaination:
		// What this basically does: return a promise made out of the children, if the children has another children
		// subset, then the method will be recursively called for those children as well, creating a chain of promises
		// for each promise, we asyncly iterate thru each element and push it into the expanded promises collection and
		// invoke a new promise with the result of all the pending promises, adding the children to the element where
		// the promise was resolved, ultimately resolving the promise after this (or rejecting it upon an error)
		return new Promise((resolve, reject) => {
			// getChildren() returns only the immediate children for this
			// with recursion, the children will have their own children found, and so on
			this.getChildren(user).then(children => {
				if(children && children.length > 0) {
					var expandPromises = [];
					async.each(children, (child, callback) => {
						expandPromises.push(child.expandChildren());
						callback();
					}, () => {
						// deal with all the expanded promises then deal with their children
						Promise.all(expandPromises).then((expandedChildren) => {
							this.children = [];
							// again another async iteator, pushing the children obtained from the promises into the array
							async.each(expandedChildren, (expandedChild, callback) => {
								this.children.push(expandedChild);
								callback();
							}, () => {
								// return self with expanded inner after 'each' callback is called
								resolve(this);
							});
						});
					})
				} else {
					//if has no comment children return self with empty children set
					this.children = []; 
					resolve(this);
				}
			}).catch(error => {
				console.log('Critical error: ' , error);
				reject(error); 
			})
		})
	}
	return comment;
};