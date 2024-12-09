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
      Appointment.belongsTo(models.Doctor, { foreignKey: 'doctorId' });
      Appointment.belongsTo(models.Patient, { foreignKey: 'patientId' });
      Appointment.belongsTo(models.Cubicle, { foreignKey: 'cubicleId' });
      Appointment.hasOne(models.Rating, {
        foreignKey: 'appointmentId'
      });
    }
  }
  Appointment.init({
    doctorId: DataTypes.INTEGER,
    patientId: DataTypes.INTEGER,
    cubicleId: DataTypes.INTEGER,
    date: DataTypes.DATEONLY,
    time: DataTypes.STRING, 
    status: DataTypes.INTEGER,
    apptReason: DataTypes.STRING,
    cancellationReason: DataTypes.STRING,
    results: DataTypes.STRING,
    deletedAt: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Appointment',
  });
  return Appointment;
};