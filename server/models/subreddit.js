'use strict';

module.exports = (sequelize, DataTypes) => {
	var subreddit = sequelize.define('subreddit', {
		name: {
			type: DataTypes.STRING,
			unique: true
		},
		description: DataTypes.STRING,
	}, {});
	subreddit.associate = function (models) {
		// associations can be defined here
		models.subreddit.belongsTo(models.user);
		models.subreddit.hasMany(models.post, { onDelete: 'cascade', hooks: true });
		models.subreddit.hasMany(models.moderator, { onDelete: 'cascade', hooks: true });
		models.subreddit.hasMany(models.rule, { onDelete: 'cascade', hooks: true });
		models.subreddit.hasMany(models.suspension, { onDelete: 'cascade', hooks: true });
	};
	subreddit.settings = {
		maxPerPage: 20
	};
	return subreddit;
};