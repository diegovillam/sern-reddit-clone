var moment = require('moment');
'use strict';

module.exports = (sequelize, DataTypes) => {
	var suspension = sequelize.define('suspension', {
		reason: DataTypes.STRING,
		expires: DataTypes.INTEGER,
		createdAtFormatted: {
			type: DataTypes.VIRTUAL,
			get: function() {
				return moment(this.createdAt, 'YYYY-MM-DDTHH:mm', false).format('MMMM Do, YYYY hh:mma');
			}
		}
	}, {});
	suspension.associate = function (models) {
		models.suspension.belongsTo(models.user);
		models.suspension.belongsTo(models.moderator);
		models.suspension.belongsTo(models.subreddit);
	};
	return suspension;
};