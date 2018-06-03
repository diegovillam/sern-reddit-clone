var bcrypt = require('bcrypt');

module.exports = (sequelize, DataTypes) => {
	var user = sequelize.define('user', {
		username: DataTypes.STRING,
		password: DataTypes.STRING,
        admin: DataTypes.INTEGER,
        karma: DataTypes.INTEGER
	},
    {
        hooks: {
            beforeCreate: (user, options) => {
                return bcrypt.hash(user.password, 10).then(hash => {
                    user.password = hash;
                })
            },
        }
    });

	user.associate = function (models) {
        // associations can be defined here
        models.user.hasMany(models.post, { onDelete: 'cascade', hooks: 'true '});
        models.user.hasMany(models.subreddit, { onDelete: 'cascade', hooks: 'true '});
        models.user.hasMany(models.postvote, { onDelete: 'cascade', hooks: 'true '});
        models.user.hasMany(models.commentvote, { onDelete: 'cascade', hooks: 'true '});
        models.user.hasMany(models.moderator, { onDelete: 'cascade', hooks: 'true '});
        models.user.hasMany(models.comment, { onDelete: 'cascade', hooks: 'true '});
        models.user.hasMany(models.message, { onDelete: 'cascade', hooks: 'true '});
	};

    user.getBriefPosts = async function(username, limit) { 
        let sql = '\
        SELECT\
            p.*,\
            (v.upVotes - v.downVotes) AS votes,\
            u.username,\
            u.id AS userId,\
            r.name as subreddit,\
            (SELECT COUNT(*) FROM comments WHERE comments.postId = p.id) AS commentCount\
        FROM posts AS p\
        LEFT JOIN(\
            SELECT \
                postId,\
                (CASE WHEN VALUE = 1 THEN 1 ELSE 0 END) AS upVotes,\
                (CASE WHEN VALUE = -1 THEN 1 ELSE 0 END) AS downVotes\
            FROM postvotes AS sub\
        ) AS v ON p.id = v.postId\
        INNER JOIN users u ON\
            u.id = p.userId\
            AND u.username="'+ username +'"\
        INNER JOIN subreddits r ON \
            r.id = p.subredditId\
        ORDER BY createdAt DESC LIMIT '+ limit;
        
        return new Promise((resolve, reject) => {
            sequelize.query(sql).spread((results, metadata) => {
                resolve(results);
            }).catch(error => reject(error));
        });
    }

    return user;
};