const bcrypt = require('bcryptjs');
const resp = require('../utils/responses');
const { sequelize, Doctor, User } = require('../models');
const { Op } = require('sequelize');
// const authenticateToken = require('../middlewares/authenticateToken');

const { Sequelize } = require('sequelize');

const createDoctor = async (req, res) => {
  const transaction = await sequelize.transaction(); // Usa la instancia sequelize en lugar de Sequelize

  try {
    const { specialtyId, cedula, firstName, lastName, phone, gender, birthday, perfil, email, password } = req.body;

    // Verificar si ya existe un doctor con la misma cédula
    const existingDoctor = await Doctor.findOne({ where: { cedula, deletedAt: null } });
    if (existingDoctor) {
      return resp.makeResponsesError(res, 'SFound');
    }

    // Encriptar la contraseña usando bcryptjs
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Crear el usuario en el modelo Usuario
    const newUser = await User.create(
      {
        email,
        password: hashedPassword,
      },
      { transaction }
    );

    // Crear el doctor en el modelo Doctor, asignando el ID del usuario
    const newDoctor = await Doctor.create(
      {
        userId: newUser.id,
        specialtyId,
        cedula,
        firstName,
        lastName,
        phone,
        gender,
        birthday,
        perfil
      },
      { transaction }
    );

    await transaction.commit();
    return resp.makeResponsesOkData(res, newDoctor, 'SCreated');

  } catch (error) {
    await transaction.rollback();
    return resp.makeResponsesError(res, error.message || 'An error occurred');
  }
};

const getAllSpecialties = async (req, res) => {
  try {
    const specialties = await Specialty.findAll({
      where: {
        deletedAt: null
      },
      order: [['updatedAt']]
    });

    resp.makeResponsesOkData(res, specialties, 'Success')

  } catch (error) {
    resp.makeResponsesError(res, error, 'UnexpectedError')
  }
};

const getSpecialty = async (req, res) => {
  try {
    const { id } = req.params;  // Extrae el id de los parámetros de la ruta

    const specialty = await Specialty.findOne({
      where: {
        id: id,            // Busca por el id que se pasa en la ruta
        deletedAt: null    // Solo busca registros que no hayan sido "borrados" (si tienes soft delete)
      }
    });

    if (!specialty) {
      // Si no se encuentra la especialidad, responde con un 404
      return res.status(404).json({ message: 'Specialty not found' });
    }

    // Si se encuentra, responde con los datos
    resp.makeResponsesOkData(res, specialty, 'Success');

  } catch (error) {
    // Manejo de errores
    resp.makeResponsesError(res, error, 'UnexpectedError');
    // O también:
    // res.status(500).json({ message: 'UnexpectedError', error: error.message });
  }
};

const updateSpecialty = async (req, res) => {

  try {  

    const id = req.params.id;

    const specialty = await Specialty.findOne({
      where: {
        id: id,
        deletedAt: null
      }
    });

    if (!specialty) {

      return resp.makeResponsesError(res, `Specialty not found or inactive`, 'SNotFound')

    } else {

    const data = req.body;

    const saveSpecialty = await Specialty.update(data, {
      where: { id: req.params.id }
    });

    return resp.makeResponsesOkData(res, saveSpecialty, 'SpecialtyUpdated')

    }

  } catch (error) {
    
    return resp.makeResponsesError(res, error, 'UnexpectedError')

  }
}

const deleteSpecialty = async (req, res) => {
  try {
    const specialtyId = req.params.id;

    const deletedSpecialty = await Specialty.update(
      { deletedAt: new Date() },
      {
        where: {
          id: specialtyId,
          deletedAt: null
        }
      }
    );

    resp.makeResponsesOkData(res, deletedSpecialty, "PDeleted");

  } catch (error) {
    console.log(error);
    resp.makeResponsesError(res, error);
  }
};

const getAllDeletedSpecialties = async (req, res) => {
  try {
    console.log('Fetching all deleted specialties'); // Log the action

    const specialties = await Specialty.findAll({
      where: {
        deletedAt: {
          [Op.ne]: null // Fetch specialties that are marked as deleted
        }
      },
      order: [['deletedAt', 'DESC']]
    });

    if (specialties.length === 0) {
      return resp.makeResponsesError(res, 'Not found', 'SNotFound');
    }

    resp.makeResponsesOkData(res, specialties, 'Success');

  } catch (error) {
    console.error('Error fetching deleted specialties:', error); // Log the error for debugging
    resp.makeResponsesError(res, error, 'UnexpectedError');
  }
};


module.exports = {
  createDoctor,
  getAllSpecialties,
  getSpecialty,
  updateSpecialty,
  deleteSpecialty,
  getAllDeletedSpecialties
};