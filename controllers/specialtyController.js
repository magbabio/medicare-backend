const resp = require('../utils/responses');
const { Specialty} = require('../models');
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
    const { name, description } = req.body;
    const specialtyId = req.params.id;

    const updatedSpecialty = await Specialty.update(
      { name, 
        description
      },
      {
        where: {
          id: specialtyId,
          deletedAt: null
        }
      }
    );

    resp.makeResponsesOkData(res, updatedSpecialty, "Success");

  } catch (error) {
    console.log(error);
    resp.makeResponsesError(res, error);
  }
};


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


module.exports = {
  createSpecialty,
  getAllSpecialties,
  getSpecialty,
  updateSpecialty,
  deleteSpecialty
};