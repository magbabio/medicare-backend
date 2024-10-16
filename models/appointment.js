'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Appointment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Appointment.init({
    doctorId: DataTypes.INTEGER,
    patientId: DataTypes.INTEGER,
    cubicleId: DataTypes.INTEGER,
    date: DataTypes.DATE,
    time: DataTypes.TIME,
    status: DataTypes.INTEGER,
    apptReason: DataTypes.STRING,
    cancellatationReason: DataTypes.STRING,
    results: DataTypes.STRING,
    deletedAt: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Appointment',
  });
  return Appointment;
};