const resp = require('../utils/responses');
const { Appointment, Schedule, Doctor, Patient, Cubicle } = require('../models');
const { Op } = require('sequelize');
const timeSlots = require('../constants/timeSlots');

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

    const doctor = await Doctor.findOne({ where: { id: doctorId, deletedAt: null } });
    if (!doctor) {
      return resp.makeResponsesError(res, 'Doctor no encontrado');
    }

    const schedules = await Schedule.findAll({
      where: { doctorId },
      attributes: ['timeSlot', 'cubiclesId'],
    });

    if (!schedules.length) {
      return resp.makeResponsesOkData(res, [], 'El doctor no tiene horarios asignados');
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0); 
    const daysInMonth = Array.from({ length: endDate.getDate() }, (_, i) => new Date(year, month - 1, i + 1));

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

            return appointments.length < schedule.timeSlot.length; 
          })
        );

        return isAvailable.some((available) => available) ? day : null; 
      })
    );

    const filteredDays = availableDays.filter(Boolean);

    return resp.makeResponsesOkData(res, filteredDays, 'Días disponibles obtenidos');
  } catch (error) {
    console.log(error);
    return resp.makeResponsesError(res, error.message || 'An error occurred');
  }
};

const getAvailableTimeSlotsForDay = async (req, res) => {
  try {
    const { doctorId, date } = req.query;

    // Validar que el doctor existe
    const doctor = await Doctor.findOne({ where: { id: doctorId, deletedAt: null } });
    if (!doctor) {
      return resp.makeResponsesError(res, 'Doctor no encontrado');
    }

    // Convertir la fecha proporcionada
    const day = new Date(date);
    day.setHours(0, 0, 0, 0);  // Asegurar que la fecha tenga hora 00:00 para comparaciones exactas

    // Verificar citas ya agendadas para el doctor en esa fecha
    const appointments = await Appointment.findAll({
      where: { doctorId, date: day },
      attributes: ['time'],
    });

    // Obtener los horarios ocupados
    const occupiedSlots = appointments.map(appointment => appointment.time);

    // Filtrar los horarios disponibles usando la constante global timeSlots
    const availableSlots = timeSlots.filter(slot => !occupiedSlots.includes(slot));

    return resp.makeResponsesOkData(res, availableSlots, 'Horarios disponibles obtenidos');
  } catch (error) {
    console.error(error);
    return resp.makeResponsesError(res, error.message || 'An error occurred');
  }
};

const bookAppointment = async (req, res) => {
  try {
    const { doctorId, patientId, date, timeSlot, apptReason } = req.body;

    const doctor = await Doctor.findOne({ where: { id: doctorId, deletedAt: null } });
    if (!doctor) {
      return resp.makeResponsesError(res, 'Doctor no encontrado');
    }

    const patient = await Patient.findOne({ where: { id: patientId, deletedAt: null } });
    if (!patient) {
      return resp.makeResponsesError(res, 'Paciente no encontrado');
    }

    const day = new Date(date);
    day.setHours(0, 0, 0, 0);  // Asegurar que la fecha tenga hora 00:00 para comparaciones exactas

    const doctorSchedule = await Schedule.findOne({
      where: { doctorId, timeSlot },
    });
    if (!doctorSchedule) {
      return resp.makeResponsesError(res, 'El doctor no tiene un horario disponible en ese momento');
    }

    const existingAppointment = await Appointment.findOne({
      where: { doctorId, date: day, time: timeSlot },
    });
    if (existingAppointment) {
      return resp.makeResponsesError(
        res,
        'Este horario ya está ocupado. Por favor, elija otro.'
      );
    }

    const cubicleId = doctorSchedule.cubiclesId;
    if (!cubicleId) {
      return resp.makeResponsesError(res, 'No hay cubículo asignado para este horario');
    }

    const newAppointment = await Appointment.create({
      doctorId,
      patientId,
      cubicleId,  // Usar el cubículo asignado al doctor para el horario
      date: day,  // Usar la fecha normalizada
      time: timeSlot,
      status: 1, // Estado activo
      apptReason,
    });

    return resp.makeResponsesOkData(res, newAppointment, 'Cita agendada exitosamente');
  } catch (error) {
    console.log(error);
    return resp.makeResponsesError(res, error.message || 'Ocurrió un error');
  }
};

const getPendingAppointmentsForDoctor = async (req, res) => {
  try {
    const { id } = req.params;
  
    const doctor = await Doctor.findOne({ where: { id, deletedAt: null } });
    if (!doctor) {
      return resp.makeResponsesError(res, 'Doctor no encontrado');
    }

    const appointments = await Appointment.findAll({
      where: { id, status: 1 }, 
      include: [
        {
          model: Patient, 
          attributes: ['id', 'firstName', 'lastName', 'cedula'],
        },
        {
          model: Cubicle,
          attributes: ['id', 'number'],
        }
      ],
      order: [['date', 'ASC'], ['time', 'ASC']], 
    });

    if (!appointments.length) {
      return resp.makeResponsesOkData(res, [], 'No hay citas pendientes para este doctor');
    }

    const formattedAppointments = appointments.map(appointment => ({
      id: appointment.id,
      date: appointment.date,
      time: appointment.time,
      status: appointment.status,
      apptReason: appointment.apptReason,
      patient: {
        id: appointment.Patient.id,
        fullName: `${appointment.Patient.firstName} ${appointment.Patient.lastName}`,
        cedula: appointment.Patient.cedula,
      },
      cubicle: {
        id: appointment.Cubicle.id,
        name: appointment.Cubicle.name,
      },
    }));

    return resp.makeResponsesOkData(res, formattedAppointments, 'Citas pendientes obtenidas');
  } catch (error) {
    console.error(error);
    return resp.makeResponsesError(res, error.message || 'An error occurred');
  }
};
  
  module.exports = {
    getAllDoctorsBySpecialty,
    getAvailableDaysForDoctor,
    getPendingAppointmentsForDoctor,
    getAvailableTimeSlotsForDay,
    bookAppointment
  };

