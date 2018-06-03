'use strict';

module.exports = (sequelize, DataTypes) => {
	var moderator = sequelize.define('moderator', {
		level: DataTypes.INTEGER,
	}, {
		getterMethods: {
			title: function() {
				if(this.level === 2) return 'an administrator';
				return 'a moderator';
			}
		}
	});

	moderator.associate = function (models) {
		// associations can be defined here
		models.moderator.belongsTo(models.user);
		models.moderator.belongsTo(models.subreddit);
	};
	return moderator;
};
