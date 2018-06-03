var moment = require('moment');

'use strict';

module.exports = (sequelize, DataTypes) => {
	var message = sequelize.define('message', {
		subject: DataTypes.STRING,
		message: DataTypes.TEXT,
		status: DataTypes.INTEGER,
		createdAtFormatted: {
			type: DataTypes.VIRTUAL,
			get: function() {
				return moment(this.createdAt, 'YYYY-MM-DDTHH:mm', false).format('MMMM Do, YYYY hh:mma');
			}
		}
	}, {});
	message.associate = function (models) {
		message.belongsTo(models.user, { as: 'sender', foreignKey: 'senderId' });
		message.belongsTo(models.user, { as: 'receiver', foreignKey: 'receiverId' });
	};
	return message;
};