const bcrypt = require('bcryptjs');
const resp = require('../utils/responses');
const { sequelize, Patient, User } = require('../models');
const { Op } = require('sequelize');
const ROLES = require('../constants/roles');

const { Sequelize } = require('sequelize');

const createPatient = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { cedula,firstName, lastName, gender, age, status, email, password } = req.body;

    const existingPatient = await Patient.findOne({ where: { cedula, deletedAt: null } });
    if (existingPatient) {
      return resp.makeResponsesError(res, 'SFound');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create(
      {
        email,
        password: hashedPassword,
        role: ROLES.PATIENT
      },
      { transaction }
    );

    const newPatient = await Patient.create(
      {
        userId: newUser.id,
        cedula,
        firstName,
        lastName, 
        gender, 
        age, 
        status
      },
      { transaction }
    );

    await transaction.commit();
    return resp.makeResponsesOkData(res, newPatient, 'SCreated');

  } catch (error) {
    await transaction.rollback();
    return resp.makeResponsesError(res, error.message || 'An error occurred');
  }
};

const getAllPatients = async (req, res) => {
  try {
    const patients = await Patient.findAll({
      where: {
        deletedAt: null
      },
      include: {
        model: User, 
        attributes: ['email'], 
      },
      order: [['updatedAt']]
    });

    resp.makeResponsesOkData(res, patients, 'Success')

  } catch (error) {
    resp.makeResponsesError(res, error, 'UnexpectedError')
  }
};

module.exports = {
    createPatient,
    getAllPatients
  };