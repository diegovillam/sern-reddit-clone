'use strict';

module.exports = (sequelize, DataTypes) => {
	var commentvote = sequelize.define('commentvote', {
		value: DataTypes.INTEGER
	}, {});
	commentvote.associate = function (models) {
		// associations can be defined here
		models.commentvote.belongsTo(models.comment);
		models.commentvote.belongsTo(models.user);
	};
	return commentvote;
};