'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Doctor extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Doctor.belongsTo(models.Specialty, { foreignKey: 'specialtyId' });
      Doctor.belongsTo(models.User, { foreignKey: 'userId' });
      Doctor.hasMany(models.Schedule, {
        foreignKey: 'doctorId'
      });
      Doctor.hasMany(models.Appointment, {
        foreignKey: 'doctorId'
      });      
    }
  }
  Doctor.init({
    userId: DataTypes.INTEGER,
    specialtyId: DataTypes.INTEGER,
    cedula: DataTypes.STRING,
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    phone: DataTypes.STRING,
    gender: DataTypes.STRING,
    perfil: DataTypes.STRING,
    deletedAt: DataTypes.DATE
  }, {
    sequelize,
    paranoid: true,
    modelName: 'Doctor',
  });
  return Doctor;
};