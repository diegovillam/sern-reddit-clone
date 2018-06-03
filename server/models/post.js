'use strict';
var slug = require('slug');
var moment = require('moment');

module.exports = (sequelize, DataTypes) => {
	var post = sequelize.define('post', {
		title: DataTypes.STRING,
		link: DataTypes.STRING,
		text: DataTypes.TEXT,
		image: DataTypes.STRING,
		// Virtuals
		score: DataTypes.VIRTUAL,
		commentCount: DataTypes.VIRTUAL,
		slug:  {
			type: DataTypes.VIRTUAL,
			get: function () {
				return slug(this.title).toLowerCase();
			}
		},
		createdAtFormatted: {
			type: DataTypes.VIRTUAL,
			get: function() {
				return moment(this.createdAt, 'YYYY-MM-DDTHH:mm', false).format('MMMM Do, YYYY hh:mma');
			}
		}
	}, {});
	post.associate = function (models) {
		// associations can be defined here
		models.post.belongsTo(models.user);
		models.post.belongsTo(models.subreddit);
		models.post.hasMany(models.postvote);
		models.post.hasMany(models.comment);
	};
	
	post.settings = {
		maxPerPage: 25
	}

	// if param subreddit is undefined, we are getting the home posts
	post.getPosts = async function (maxPerPage, page, userId = undefined, subreddit = undefined) {
		// This returns a list of posts with its title, upvotes, dwnvotes, score
		// Score is calculated by lower bound of Wilson score confidence interval for a Bernoulli parameter
		// http://www.evanmiller.org/how-not-to-sort-by-average-rating.html
		let sql = '\
		SELECT\
			p.id AS id,\
			p.title AS title,\
			p.text,\
			u.username,\
			u.id AS userId,\
			r.name as subreddit,\
			r.id as subredditId,\
			s.id as suspension,\
			uv.value as userVote,\
			v.upVotes,\
			v.downVotes,\
			v.score,\
			(SELECT COUNT(*) FROM comments WHERE comments.postId = p.id) AS commentCount\
		FROM posts AS p\
		INNER JOIN users u ON u.id = p.userId\
		INNER JOIN subreddits r ON r.id = p.subredditId ' + (subreddit !== undefined ? ('AND r.name = "' + subreddit + '"') : '') + '\
		LEFT JOIN suspensions s ON s.userId ' + ((userId === undefined) ? ('IS NULL') : ('= ' + ('' + userId))) +' AND s.subredditId = p.subredditId\
		LEFT JOIN (\
		SELECT postId, \
			upVotes, \
			downVotes,\
			((upVotes + 1.9208) /(upVotes + downVotes) - 1.96 * SQRT((upVotes * downVotes) /(upVotes + downVotes) + 0.9604) /(upVotes + downVotes)) /(1 + 3.8416 /(upVotes + downVotes)) AS score\
			FROM (\
				SELECT postId, \
				COUNT(CASE WHEN value=1 THEN 1 ELSE NULL END) as upVotes,\
				COUNT(CASE WHEN value=-1 THEN 1 ELSE NULL END) as downVotes\
				FROM postVotes GROUP BY postId\
			) x GROUP BY postId    \
		) v ON v.postId = p.id\
		LEFT JOIN postvotes uv ON uv.postId = p.id AND uv.userId ' + ((userId === undefined) ? ('IS NULL') : ('= ' + ('' + userId))) + '\
		ORDER BY v.score DESC LIMIT ' + maxPerPage + ' OFFSET ' + (page * maxPerPage) + ';';

		return new Promise((resolve, reject) => {
			sequelize.query(sql).spread(async (results, metadata) => {
				var count = await sequelize.models.post.count();
				var pagedata = {
					current: Number(page),
					hasPrevious: page > 0,
					hasNext: count >= ((page + 1) * maxPerPage)
				}
				resolve({posts: results, pagedata: pagedata});
			}).catch(error => reject(error));
		})
	}

	post.prototype.getVoteCounts = async function () {
		return new Promise((resolve, reject) => {
			sequelize.query(
			'SELECT (SELECT COUNT(CASE WHEN value=1 THEN 1 ELSE NULL END) FROM postvotes WHERE postvotes.postId='+this.id+') AS upvotes, (SELECT COUNT(CASE WHEN value=-1 THEN 1 ELSE NULL END) FROM postvotes WHERE postvotes.postId='+this.id+') AS downvotes, (SELECT (upvotes - downvotes)) AS total', 
			{ type: sequelize.QueryTypes.SELECT }).then(votes => {
				resolve(votes[0]);
			}).catch(error => {
				reject(error);
			});
		});
	}
	post.prototype.getScore = async function(up, down) {
		// Lower bound of Wilson score confidence interval for a Bernoulli parameter
		// http://www.evanmiller.org/how-not-to-sort-by-average-rating.html
		return new Promise((resolve, reject) => {
			try {
				resolve((up + 1.9208) / (up + down) - 1.96 * Math.sqrt((up * down) / (up + down) + 0.9604) /  (up + down)) / (1 + 3.8416 / (up + down));
			} catch (e) {
				reject(e);
			}
		});
	}
	return post;
};