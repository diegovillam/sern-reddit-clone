var models = require('./../models');
'use strict';

module.exports = (sequelize, DataTypes) => {
	var postvote = sequelize.define('postvote', {
		value: DataTypes.INTEGER
	}, {});
	postvote.associate = function (models) {
		// associations can be defined here
		models.postvote.belongsTo(models.post);
		models.postvote.belongsTo(models.user);
	};
	return postvote;
};