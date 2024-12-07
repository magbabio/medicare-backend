const resp = require('../utils/responses');
const { Cubicle, Doctor, Schedule } = require('../models');
const { Op } = require('sequelize');
const timeSlots = require('../constants/timeSlots');
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

      return resp.makeResponsesOkData(res, newCubicle, 'CCreated');
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
    console.log(error);
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

    await cubicle.update(data);

    return resp.makeResponsesOkData(res, cubicle, 'CUpdated')

    }

  } catch (error) {
    
    return resp.makeResponsesError(res, error, 'UnexpectedError')

  }
}

const deleteCubicle = async (req, res) => {
  try {
    const cubicleId = req.params.id;

    const cubicle = await Cubicle.findOne({
      where: {
        id: cubicleId
      }
    });

    if (!cubicle) {

      return resp.makeResponsesError(res, `Cubicle not found or inactive`, 'SNotFound')

    } else {

    await cubicle.destroy();

    resp.makeResponsesOkData(res, cubicle, "CDeleted");

    }
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
      paranoid: false,
      order: [['deletedAt', 'DESC']]
    });

    if (cubicles.length === 0) {
      return resp.makeResponsesError(res, 'Not found', 'CNotFound');
    }

    resp.makeResponsesOkData(res, cubicles, 'Success');

  } catch (error) {
    resp.makeResponsesError(res, error, 'UnexpectedError');
  }
};

const activateCubicle = async (req, res) => {

  try {

    const id = req.params.id;

    const cubicle = await Cubicle.findOne({
      where: {
        id: id,
        deletedAt: {
          [Op.ne]: null
        }
      },
      paranoid: false,
    });

    if (!cubicle) {
      return resp.makeResponsesError(res, `Cubicle not found or active`, 'SNotFound')
    }

    await cubicle.restore()

    resp.makeResponsesOkData(res, cubicle, 'CActivated')

  } catch (error) {
    resp.makeResponsesError(res, error, 'UnexpectedError')

  }
}

const assignDoctorToCubicle = async (req, res) => {
  try {
    const { cubiclesId, doctorId, timeSlot } = req.body;

    if (!timeSlots.includes(timeSlot)) {
      return resp.makeResponsesError(res, 'InvalidSchedule');
    }

    const cubicle = await Cubicle.findOne({ where: { id: cubiclesId, deletedAt: null } });
    if (!cubicle) {
      return resp.makeResponsesError(res, 'CNotFound');
    }

    const doctor = await Doctor.findOne({ where: { id: doctorId, deletedAt: null } });
    if (!doctor) {
      return resp.makeResponsesError(res, 'DNotFound');
    }

    const doctorConflict = await Schedule.findOne({
      where: { doctorId, timeSlot },
    });
    if (doctorConflict) {
      return resp.makeResponsesError(res, 'SlotTaken');
    }

    const existingSchedule = await Schedule.findOne({
      where: { cubiclesId, timeSlot },
    });

    if (existingSchedule) {
      existingSchedule.doctorId = doctorId;
      await existingSchedule.save();
      return resp.makeResponsesOkData(res, existingSchedule, 'ScheduleUpdated');
    }

    const newSchedule = await Schedule.create({
      cubiclesId,
      doctorId,
      timeSlot,
    });

    return resp.makeResponsesOkData(res, newSchedule, 'ScheduleCreated');
  } catch (error) {
    return resp.makeResponsesError(res, error.message || 'An error occurred');
  }
};

const getCubicleSchedule = async (req, res) => {
  try {
    const { cubiclesId } = req.params;

    const cubicle = await Cubicle.findOne({ where: { id: cubiclesId, deletedAt: null } });
    if (!cubicle) {
      return resp.makeResponsesError(res, 'Cubículo no encontrado');
    }

    const schedules = await Schedule.findAll({
      where: { cubiclesId },
      include: [
        {
          model: Doctor,
          attributes: ['id', 'cedula', 'firstName', 'lastName'], 
        },
      ],
    });

    const scheduleMap = {};
    timeSlots.forEach(slot => {
      scheduleMap[slot] = null; 
    });

    if (schedules && schedules.length > 0) {
      schedules.forEach(schedule => {
        if (schedule.timeSlot in scheduleMap) {
          scheduleMap[schedule.timeSlot] = schedule.Doctor
            ? {
                id: schedule.Doctor.id,
                cedula: schedule.Doctor.cedula,
                firstName: schedule.Doctor.firstName,
                lastName: schedule.Doctor.lastName,
              }
            : null;
        }
      });
    }

    const formattedSchedule = timeSlots.map(slot => ({
      time: formatTime(slot), 
      doctor: scheduleMap[slot]
        ? `${scheduleMap[slot].firstName} ${scheduleMap[slot].lastName}`
        : 'Disponible',
      doctorId: scheduleMap[slot]?.id || null, 
    }));

    return resp.makeResponsesOkData(res, formattedSchedule, 'Horarios obtenidos');
  } catch (error) {
    console.error(error);
    return resp.makeResponsesError(res, error.message || 'An error occurred');
  }
};

const formatTime = (time) => {
  const [hour, minute] = time.split(':');
  const amPm = hour >= 12 ? 'pm' : 'am';
  const formattedHour = hour % 12 || 12; 
  return `${formattedHour}${amPm}`;
};


module.exports = {
  createCubicle,
  getAllCubicles,
  getCubicle,
  updateCubicle,
  deleteCubicle,
  getAllDeletedCubicles,
  activateCubicle,
  assignDoctorToCubicle,
  getCubicleSchedule
};