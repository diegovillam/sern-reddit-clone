'use strict';
module.exports = (sequelize, DataTypes) => {
	var rule = sequelize.define('rule', {
		title: DataTypes.STRING,
		description: DataTypes.TEXT,
		number: DataTypes.INTEGER,
		type: DataTypes.INTEGER
	}, {});
	rule.associate = function (models) {
		models.rule.belongsTo(models.subreddit);
	};
	return rule;
};