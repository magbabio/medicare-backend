const resp = require('../utils/responses');
const { Cubicle } = require('../models');
const { Op } = require('sequelize');
// const authenticateToken = require('../middlewares/authenticateToken');

const createCubicle = async (req, res) => {
  try {
    const { number, description, deletedAt } = req.body;

    const cubicle = await Cubicle.findOne({ where: { number, deletedAt: null } });
      
    if (cubicle) {
      return resp.makeResponsesError(res, 'SFound');
    } else {
      const newCubicle = await Cubicle.create({
        number,
        description,
        deletedAt
      });

      return resp.makeResponsesOkData(res, newCubicle, 'SCreated');
    }

  } catch (error) {
    console.log(error);
    return resp.makeResponsesError(res, error.message || 'An error occurred');
  }
};


const getAllCubicles = async (req, res) => {
  try {
    const cubicles = await Cubicle.findAll({
      where: {
        deletedAt: null
      },
      order: [['updatedAt']]
    });

    resp.makeResponsesOkData(res, cubicles, 'Success')

  } catch (error) {
    resp.makeResponsesError(res, error, 'UnexpectedError')
  }
};

const getCubicle = async (req, res) => {
  try {
    const { id } = req.params;  // Extrae el id de los parámetros de la ruta

    const cubicle = await Cubicle.findOne({
      where: {
        id: id,            // Busca por el id que se pasa en la ruta
        deletedAt: null    // Solo busca registros que no hayan sido "borrados" (si tienes soft delete)
      }
    });

    if (!cubicle) {
      // Si no se encuentra la especialidad, responde con un 404
      return res.status(404).json({ message: 'Cubicle not found' });
    }

    // Si se encuentra, responde con los datos
    resp.makeResponsesOkData(res, cubicle, 'Success');

  } catch (error) {
    // Manejo de errores
    resp.makeResponsesError(res, error, 'UnexpectedError');
    // O también:
    // res.status(500).json({ message: 'UnexpectedError', error: error.message });
  }
};

const updateCubicle = async (req, res) => {

  try {  

    const id = req.params.id;

    const cubicle = await Cubicle.findOne({
      where: {
        id: id,
        deletedAt: null
      }
    });

    if (!cubicle) {

      return resp.makeResponsesError(res, `Cubicle not found or inactive`, 'SNotFound')

    } else {

    const data = req.body;

    const saveCubicle = await Cubicle.update(data, {
      where: { id: req.params.id }
    });

    return resp.makeResponsesOkData(res, saveCubicle, 'CubicleUpdated')

    }

  } catch (error) {
    
    return resp.makeResponsesError(res, error, 'UnexpectedError')

  }
}

const deleteCubicle = async (req, res) => {
  try {
    const cubicleId = req.params.id;

    const deletedCubicle = await Cubicle.update(
      { deletedAt: new Date() },
      {
        where: {
          id: cubicleId,
          deletedAt: null
        }
      }
    );

    resp.makeResponsesOkData(res, deletedCubicle, "PDeleted");

  } catch (error) {
    resp.makeResponsesError(res, error);
  }
};

const getAllDeletedCubicles = async (req, res) => {
  try {
    const cubicles = await Cubicle.findAll({
      where: {
        deletedAt: {
          [Op.ne]: null 
        }
      },
      order: [['deletedAt', 'DESC']]
    });

    if (cubicles.length === 0) {
      return resp.makeResponsesError(res, 'Not found', 'SNotFound');
    }

    resp.makeResponsesOkData(res, cubicles, 'Success');

  } catch (error) {
    resp.makeResponsesError(res, error, 'UnexpectedError');
  }
};


module.exports = {
  createCubicle,
  getAllCubicles,
  getCubicle,
  updateCubicle,
  deleteCubicle,
  getAllDeletedCubicles
};