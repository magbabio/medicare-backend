'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Patient extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Patient.belongsTo(models.User,  { foreignKey: 'userId' });
      Patient.hasMany(models.Appointment, {
        foreignKey: 'patientId'
      });
      Patient.hasMany(models.Rating, {
        foreignKey: 'patientId'
      });
    }
  }
  Patient.init({
    userId: DataTypes.INTEGER,
    cedula: DataTypes.STRING,
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    gender: DataTypes.STRING,
    age: DataTypes.STRING,
    status: DataTypes.BOOLEAN,
    deletedAt: DataTypes.DATE
  }, {
    sequelize,
    paranoid: true,
    modelName: 'Patient',
  });
  return Patient;
};