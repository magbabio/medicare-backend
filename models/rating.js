'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Rating extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Rating.belongsTo(models.Appointment, { foreignKey: 'appointmentId' });
      Rating.belongsTo(models.Patient, { foreignKey: 'patientId' });
    }
  }
  Rating.init({
    appointmentId: DataTypes.INTEGER,
    patientId: DataTypes.INTEGER,
    rating: DataTypes.INTEGER,
    review: DataTypes.STRING,
    deletedAt:DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Rating',
  });
  return Rating;
};