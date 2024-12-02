const bcrypt = require('bcryptjs');
const resp = require('../utils/responses');
const { sequelize, Doctor, User, Specialty, Schedule, Appointment } = require('../models');
const { Op } = require('sequelize');
const ROLES = require('../constants/roles');
// const authenticateToken = require('../middlewares/authenticateToken');

const { Sequelize } = require('sequelize');

const createDoctor = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { specialtyId, cedula, firstName, lastName, phone, gender, perfil, email, password } = req.body;

    const existingDoctor = await Doctor.findOne({ where: { cedula, deletedAt: null } });
    if (existingDoctor) {
      return resp.makeResponsesError(res, 'DFound');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create(
      {
        email,
        password: hashedPassword,
        role: ROLES.DOCTOR, 
      },
      { transaction }
    );

    const newDoctor = await Doctor.create(
      {
        userId: newUser.id,
        specialtyId,
        cedula,
        firstName,
        lastName,
        phone,
        gender,
        perfil
      },
      { transaction }
    );

    await transaction.commit();
    return resp.makeResponsesOkData(res, newDoctor, 'DCreated');

  } catch (error) {
    console.log(error);
    await transaction.rollback();
    return resp.makeResponsesError(res, error.message || 'An error occurred');
  }
};

const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.findAll({
      where: {
        deletedAt: null
      },
      include: {
        model: Specialty, 
        attributes: ['name'], 
      },
      order: [['updatedAt']]
    });

    resp.makeResponsesOkData(res, doctors, 'Success')

  } catch (error) {
    console.log(error);
    resp.makeResponsesError(res, error, 'UnexpectedError')
  }
};

const getDoctor = async (req, res) => {
  try {
    const { id } = req.params;  

    const doctor = await Doctor.findOne({
      where: {
        id: id,            
        deletedAt: null    
      },
      include: {
        model: User, 
        attributes: ['email'], 
      },
    });

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    resp.makeResponsesOkData(res, doctor, 'Success');

  } catch (error) {
    resp.makeResponsesError(res, error, 'UnexpectedError');
  }
};

const updateDoctor = async (req, res) => {

  try {  

    const id = req.params.id;

    const doctor = await Doctor.findOne({
      where: {
        id: id,
        deletedAt: null
      }
    });

    if (!doctor) {

      return resp.makeResponsesError(res, `Doctor not found or inactive`, 'DNotFound')

    } else {

    const data = req.body;

    await doctor.update(data);

    return resp.makeResponsesOkData(res, doctor, 'DUpdated')

    }

  } catch (error) {
    
    return resp.makeResponsesError(res, error, 'UnexpectedError')

  }
}

const deleteDoctor = async (req, res) => {
  try {
    const doctorId = req.params.id;

    const doctor = await Doctor.findOne({
      where: {
        id: doctorId
      }
    });

    if (!doctor) {

      return resp.makeResponsesError(res, `Doctor not found or inactive`, 'DNotFound')

    } else {

    await doctor.destroy();

    resp.makeResponsesOkData(res, doctor, "DDeleted");

    }
  } catch (error) {
    resp.makeResponsesError(res, error);
  }
};

const getAllDeletedDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.findAll({
      where: {
        deletedAt: {
          [Op.ne]: null
        }
      },
      include: {
        model: Specialty, 
        attributes: ['name'], 
      },
      paranoid: false,
      order: [['deletedAt', 'DESC']]
    });

    if (doctors.length === 0) {
      return resp.makeResponsesError(res, 'Not found', 'SNotFound');
    }

    resp.makeResponsesOkData(res, doctors, 'Success');

  } catch (error) {
    resp.makeResponsesError(res, error, 'UnexpectedError');
  }
};

const activateDoctor = async (req, res) => {
  try {

    const id = req.params.id;

    const doctor = await Doctor.findOne({
      where: {
        id: id,
        deletedAt: {
          [Op.ne]: null
        }
      },
      paranoid: false,
    });

    if (!doctor) {
      return resp.makeResponsesError(res, `Doctor not found or active`, 'SNotFound')
    }

    await doctor.restore()

    resp.makeResponsesOkData(res, doctor, 'DActivated')

  } catch (error) {
    resp.makeResponsesError(res, error, 'UnexpectedError')

  }
}

const searchDoctors = async (req, res) => {
  try {
    const { cubiclesId, timeSlot, query } = req.query;

    // Validamos que los parámetros esenciales estén presentes
    if (!cubiclesId || !timeSlot || !query) {
      return resp.makeResponsesError(res, 'Parámetros incompletos');
    }

    // Buscar los doctores que ya están ocupados en ese cubículo, fecha y horario
    const existingSchedules = await Schedule.findAll({
      where: {
        cubiclesId,
        timeSlot,
        deletedAt: null
      },
      include: [Doctor]  // Incluir información del doctor asignado
    });

    // Extraemos los IDs de los doctores ya ocupados
    const occupiedDoctorIds = existingSchedules.map(schedule => schedule.doctorId);

    // Buscar los doctores disponibles que coincidan con el texto 'query'
    const availableDoctors = await Doctor.findAll({
      where: {
        name: {
          [Op.iLike]: `%${query}%`  // Filtrar por nombre de doctor que contenga el texto buscado (insensible a mayúsculas/minúsculas)
        },
        id: {
          [Op.notIn]: occupiedDoctorIds  // Excluir doctores ya ocupados en ese horario
        },
        deletedAt: null  // Asegurarse de que el doctor no esté eliminado
      },
      limit: 10  // Limitar la cantidad de doctores devueltos para evitar demasiados resultados
    });

    // Responder con los doctores disponibles que coincidan con la búsqueda
    const doctorOptions = availableDoctors.map(doctor => ({
      value: doctor.id,
      label: doctor.firstName
    }));

    return resp.makeResponsesOkData(res, doctorOptions, 'Doctores encontrados');
  } catch (error) {
    console.error(error);
    return resp.makeResponsesError(res, error.message || 'Error al buscar doctores');
  }
};

const getAllDoctorsBySpecialty = async (req, res) => {
  try {
    const { specialtyId } = req.query;

    const doctors = await Doctor.findAll({
      where: {
        deletedAt: null
      },
      include: {
        model: Specialty,
        where: specialtyId ? { id: specialtyId } : {},
        attributes: ['name']
      },
      order: [['updatedAt']]
    });

    resp.makeResponsesOkData(res, doctors, 'Success');

  } catch (error) {
    console.log(error);
    resp.makeResponsesError(res, error, 'UnexpectedError');
  }
};

const getAvailableDaysForDoctor = async (req, res) => {
  try {
    const { doctorId, month, year } = req.query;

    // Validar que el doctor existe
    const doctor = await Doctor.findOne({ where: { id: doctorId, deletedAt: null } });
    if (!doctor) {
      return resp.makeResponsesError(res, 'Doctor no encontrado');
    }

    // Obtener todos los horarios asignados al doctor
    const schedules = await Schedule.findAll({
      where: { doctorId },
      attributes: ['timeSlot', 'cubiclesId'],
    });

    if (!schedules.length) {
      return resp.makeResponsesOkData(res, [], 'El doctor no tiene horarios asignados');
    }

    // Generar los días del mes
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0); // Último día del mes
    const daysInMonth = Array.from({ length: endDate.getDate() }, (_, i) => new Date(year, month - 1, i + 1));

    // Verificar disponibilidad por día
    const availableDays = await Promise.all(
      daysInMonth.map(async (day) => {
        const isAvailable = await Promise.all(
          schedules.map(async (schedule) => {
            const appointments = await Appointment.findAll({
              where: {
                doctorId,
                cubicleId: schedule.cubiclesId,
                date: day,
              },
            });

            return appointments.length < schedule.timeSlot.length; // Si hay espacio disponible en ese cubículo y horario
          })
        );

        return isAvailable.some((available) => available) ? day : null; // Si al menos un horario está disponible
      })
    );

    // Filtrar los días disponibles (no null)
    const filteredDays = availableDays.filter(Boolean);

    return resp.makeResponsesOkData(res, filteredDays, 'Días disponibles obtenidos');
  } catch (error) {
    console.log(error);
    return resp.makeResponsesError(res, error.message || 'An error occurred');
  }
};



module.exports = {
  createDoctor,
  getAllDoctors,
  getDoctor,
  updateDoctor,
  deleteDoctor,
  getAllDeletedDoctors,
  activateDoctor,
  searchDoctors,
  getAllDoctorsBySpecialty,
  getAvailableDaysForDoctor
};