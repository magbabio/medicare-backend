const resp = require('../utils/responses');
const { Appointment, Schedule, Doctor, Patient } = require('../models');
const { Op } = require('sequelize');
const timeSlots = require('../constants/timeSlots');

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
      const { doctorId, patientId, cubicleId, date, timeSlot, apptReason } = req.body;
  
      // Verificar que el doctor existe
      const doctor = await Doctor.findOne({ where: { id: doctorId, deletedAt: null } });
      if (!doctor) {
        return resp.makeResponsesError(res, 'Doctor no encontrado');
      }
  
      // Verificar que el paciente existe
      const patient = await Patient.findOne({ where: { id: patientId, deletedAt: null } });
      if (!patient) {
        return resp.makeResponsesError(res, 'Paciente no encontrado');
      }
  
      // Verificar conflictos con citas ya existentes
      const existingAppointment = await Appointment.findOne({
        where: { doctorId, cubicleId, date, time: timeSlot },
      });
      if (existingAppointment) {
        return resp.makeResponsesError(res, 'Este horario ya está ocupado');
      }
  
      // Crear la cita
      const newAppointment = await Appointment.create({
        doctorId,
        patientId,
        cubicleId,
        date,
        time: timeSlot,
        status: 1, // Estado activo
        apptReason,
      });
  
      return resp.makeResponsesOkData(res, newAppointment, 'Cita agendada exitosamente');
    } catch (error) {
      console.log(error);
      return resp.makeResponsesError(res, error.message || 'An error occurred');
    }
  };
  
  
  module.exports = {
    getAvailableTimeSlotsForDay,
    bookAppointment
  };

