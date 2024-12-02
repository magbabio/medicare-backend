'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Cubicle extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Cubicle.hasMany(models.Schedule, {
        foreignKey: 'cubiclesId'
      });
      Cubicle.hasMany(models.Appointment, {
        foreignKey: 'cubicleId'
      });
    }
  }
  Cubicle.init({
    number: DataTypes.INTEGER,
    description: DataTypes.STRING,
    deletedAt: DataTypes.DATE
  }, {
    sequelize,
    paranoid: true,
    modelName: 'Cubicle',
  });
  return Cubicle;
};