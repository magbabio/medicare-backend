const resp = require('../utils/responses');
const { Specialty} = require('../models');
const { Op } = require('sequelize');
// const authenticateToken = require('../middlewares/authenticateToken');

const createSpecialty = async (req, res) => {
    try {
      const { id, name, description, deletedAt } = req.body;
  
      const specialty = await Specialty.findOne({ where: { name, deletedAt: null } });
        
      if (specialty) {
        return resp.makeResponsesError(res, 'SFound');
      } else {
        const newSpecialty = await Specialty.create({
          name,
          description,
          deletedAt
        });

        const saveSpecialty = await newSpecialty.save();
  
        return resp.makeResponsesOkData(res, saveSpecialty, 'SCreated');
      }
  
    } catch (error) {
      console.log(error);
      console.error(error);
      return resp.makeResponsesError(res, error.message || 'An error occurred');
    }
  }

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

    await specialty.update(data);

    return resp.makeResponsesOkData(res, specialty, 'SpecialtyUpdated')

    }

  } catch (error) {
    
    return resp.makeResponsesError(res, error, 'UnexpectedError')

  }
}

const deleteSpecialty = async (req, res) => {
  try {
    const specialtyId = req.params.id;

    const specialty = await Specialty.findOne({
      where: {
        id: specialtyId
      }
    });

    if (!specialty) {

      return resp.makeResponsesError(res, `Specialty not found or inactive`, 'SNotFound')

    } else {

    await specialty.destroy();

    resp.makeResponsesOkData(res, specialty, "PDeleted");

    }
  } catch (error) {
    resp.makeResponsesError(res, error);
  }
};

const getAllDeletedSpecialties = async (req, res) => {
  try {
    const specialties = await Specialty.findAll({
      where: {
        deletedAt: {
          [Op.ne]: null
        }
      },
      paranoid: false,
      order: [['deletedAt', 'DESC']]
    });

    if (specialties.length === 0) {
      return resp.makeResponsesError(res, 'Not found', 'SNotFound');
    }

    resp.makeResponsesOkData(res, specialties, 'Success');

  } catch (error) {
    resp.makeResponsesError(res, error, 'UnexpectedError');
  }
};

const activateSpecialty = async (req, res) => {

  try {

    const id = req.params.id;

    const specialty = await Specialty.findOne({
      where: {
        id: id,
        deletedAt: {
          [Op.ne]: null
        }
      },
      paranoid: false,
    });

    if (!specialty) {
      return resp.makeResponsesError(res, `Specialty not found or active`, 'SNotFound')
    }

    await specialty.restore()

    resp.makeResponsesOkData(res, specialty, 'UReactivated')

  } catch (error) {
    resp.makeResponsesError(res, error, 'UnexpectedError')

  }
}


module.exports = {
  createSpecialty,
  getAllSpecialties,
  getSpecialty,
  updateSpecialty,
  deleteSpecialty,
  getAllDeletedSpecialties,
  activateSpecialty
};