'use strict';
const {
  Model
} = require('sequelize');
const Patient = require('./patient');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      User.hasMany(models.Patient, {
        foreignKey: 'userId'
      });
      User.hasMany(models.Doctor, {
        foreignKey: 'userId'
      });
    }
  }
  User.init({
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    role: DataTypes.STRING,
    deletedAt: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};

 /* cuando el usuario se va a logear necesita identificarse de acuerdo al rol, 

 tabla rol o permisos (responsabilidades) o acciones, esta asociada con atributo role de user

no necesito tabla roles-usuarios, si quiero puede tener la tabla rol que especifica la descp de rol
role de user asociar con tabla de permisos 

 acciones que puede hacer el rol de doctor en una tabla

 casilla ingresar como paciente o como doctor 

 mismo login, pero con rol, si el rol no coincide con lo que esta guardado en BD

 es la misma autenticacion en el login

*/