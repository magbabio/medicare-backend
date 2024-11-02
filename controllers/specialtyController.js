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
    const { id } = req.params;  

    const specialty = await Specialty.findOne({
      where: {
        id: id,            
        deletedAt: null    
      }
    });

    if (!specialty) {
      return res.status(404).json({ message: 'Specialty not found' });
    }

    resp.makeResponsesOkData(res, specialty, 'Success');

  } catch (error) {
    resp.makeResponsesError(res, error, 'UnexpectedError');
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

    return resp.makeResponsesOkData(res, specialty, 'SUpdated')

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

    resp.makeResponsesOkData(res, specialty, "SDeleted");

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

    resp.makeResponsesOkData(res, specialty, 'SActivated')

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