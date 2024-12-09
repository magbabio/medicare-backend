'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Schedule extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Schedule.belongsTo(models.Doctor, { foreignKey: 'doctorId' });
      Schedule.belongsTo(models.Cubicle, { foreignKey: 'cubiclesId' });
    }
  }
  Schedule.init({
    doctorId: DataTypes.INTEGER,
    cubiclesId: DataTypes.INTEGER,
    timeSlot: DataTypes.STRING,
    deletedAt: DataTypes.DATE
  }, {
    sequelize,
    paranoid: true,
    modelName: 'Schedule',
  });
  return Schedule;
};