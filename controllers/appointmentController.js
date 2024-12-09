const resp = require('../utils/responses');
const { Appointment, Schedule, Doctor, Patient, Cubicle, Specialty } = require('../models');
const { Op } = require('sequelize');
const timeSlots = require('../constants/timeSlots');
const appointmentStatus = require('../constants/appointmentStatus');

// Métodos de cita del paciente

const getSpecialties = async (req, res) => {
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
      return resp.makeResponsesError(res, 'DNotFound');
    }

    const schedules = await Schedule.findAll({
      where: { doctorId },
      attributes: ['timeSlot', 'cubiclesId'],
    });

    if (!schedules.length) {
      return resp.makeResponsesOkData(res, [], 'NoScheduleAssigned');
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

    return resp.makeResponsesOkData(res, filteredDays, 'DaysFound');
  } catch (error) {
    console.log(error);
    return resp.makeResponsesError(res, error.message || 'An error occurred');
  }
};


const getAvailableTimeSlotsForDay = async (req, res) => {
  try {
    const { doctorId, date } = req.query;

    const doctor = await Doctor.findOne({ where: { id: doctorId, deletedAt: null } });
    if (!doctor) {
      return resp.makeResponsesError(res, 'DNotFound');
    }

    const day = new Date(date);
    day.setHours(0, 0, 0, 0);  

    const appointments = await Appointment.findAll({
      where: { doctorId, date: day },
      attributes: ['time'],
    }); // hacer lo mismo con schedule

    const occupiedSlots = appointments.map(appointment => appointment.time);

    // user schedule para traer los bloques de horario de ese doctor
    const availableSlots = timeSlots.filter(slot => !occupiedSlots.includes(slot));

    return resp.makeResponsesOkData(res, availableSlots, 'SlotsFound');
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
      return resp.makeResponsesError(res, 'DNotFound');
    }

    const patient = await Patient.findOne({ where: { id: patientId, deletedAt: null } });
    if (!patient) {
      return resp.makeResponsesError(res, 'PNotFound');
    }

    const formattedDate = new Date(date).toISOString().split('T')[0]; // Formatea la fecha como YYYY-MM-DD

    const doctorSchedule = await Schedule.findOne({
      where: { doctorId, timeSlot: timeSlot }, 
    });
    if (!doctorSchedule) {
      return resp.makeResponsesError(res, 'NoSchedule');
    }

    const existingAppointment = await Appointment.findOne({
      where: { doctorId, date: formattedDate, time: timeSlot },
    });
    if (existingAppointment) {
      return resp.makeResponsesError(res, 'ScheduleTaken');
    }

    const cubicleId = doctorSchedule.cubiclesId;
    if (!cubicleId) {
      return resp.makeResponsesError(res, 'NoCubicle');
    }

    const newAppointment = await Appointment.create({
      doctorId,
      patientId,
      cubicleId, // usar el cubiculo asignado al doctor para el horario
      date: formattedDate,
      time: timeSlot,
      status: appointmentStatus.PENDING,
      apptReason,
    });

    return resp.makeResponsesOkData(res, newAppointment, 'ACreated');
  } catch (error) {
    return resp.makeResponsesError(res, error.message || 'Ocurrió un error');
  }
};

const getAppointmentsForPatient = async (req, res) => {
  try {
    const { id } = req.params; // ID del paciente
    const { status } = req.query; // Estado opcional

    // Verifica si el paciente existe
    const patient = await Patient.findOne({ where: { id, deletedAt: null } });
    if (!patient) {
      return resp.makeResponsesError(res, 'PNotFound');
    }

    // Construye el filtro dinámicamente según el estado
    const whereClause = { patientId: id };
    if (status) {
      whereClause.status = status;
    }

    // Obtiene las citas
    const appointments = await Appointment.findAll({
      where: whereClause,
      include: [
        {
          model: Doctor,
          attributes: ['id', 'firstName', 'lastName', 'speciality'],
        },
        {
          model: Cubicle,
          attributes: ['id', 'number'],
        },
      ],
      order: [['date', 'ASC'], ['time', 'ASC']],
    });

    // Si no hay citas, responde con un arreglo vacío
    if (!appointments.length) {
      return resp.makeResponsesOkData(res, [], 'NoAppts');
    }

    // Formatea las citas para la respuesta
    const formattedAppointments = appointments.map(appointment => ({
      id: appointment.id,
      date: appointment.date,
      time: appointment.time,
      status: appointment.status,
      apptReason: appointment.apptReason,
      doctor: {
        id: appointment.Doctor.id,
        fullName: `${appointment.Doctor.firstName} ${appointment.Doctor.lastName}`,
        speciality: appointment.Doctor.speciality,
      },
      cubicle: {
        id: appointment.Cubicle.id,
        number: appointment.Cubicle.number,
      },
    }));

    return resp.makeResponsesOkData(res, formattedAppointments, 'ApptsFound');
  } catch (error) {
    console.error(error);
    return resp.makeResponsesError(res, error.message || 'An error occurred');
  }
};



// Métodos de cita del doctor
// Visualizar listado de citas pendientes para un doctor
const getAppointmentsForDoctor = async (req, res) => {
  try {
    const { id } = req.params; // ID del doctor
    const { status } = req.query; // Estado opcional

    // Verifica si el doctor existe
    const doctor = await Doctor.findOne({ where: { id, deletedAt: null } });
    if (!doctor) {
      return resp.makeResponsesError(res, 'DNotFound');
    }

    // Construye el filtro dinámicamente según el estado
    const whereClause = { doctorId: id };
    if (status) {
      whereClause.status = status;
    }

    // Obtiene las citas
    const appointments = await Appointment.findAll({
      where: whereClause,
      include: [
        {
          model: Patient,
          attributes: ['id', 'firstName', 'lastName', 'cedula'],
        },
        {
          model: Cubicle,
          attributes: ['id', 'number'],
        },
      ],
      order: [['date', 'ASC'], ['time', 'ASC']],
    });

    // Si no hay citas, responde con un arreglo vacío
    if (!appointments.length) {
      return resp.makeResponsesOkData(res, [], 'NoAppts');
    }

    // Formatea las citas para la respuesta
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
        number: appointment.Cubicle.number,
      },
    }));

    return resp.makeResponsesOkData(res, formattedAppointments, 'ApptsFound');
  } catch (error) {
    console.error(error);
    return resp.makeResponsesError(res, error.message || 'An error occurred');
  }
};

const getTodayAppointmentsForDoctor = async (req, res) => {
  try {
    const { doctorId } = req.query;

    const doctor = await Doctor.findOne({ where: { id: doctorId, deletedAt: null } });
    if (!doctor) {
      return resp.makeResponsesError(res, 'DNotFound');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const formattedToday = today.toISOString().split('T')[0];

    const appointments = await Appointment.findAll({
      where: {
        doctorId,
        date: formattedToday,
      },
      include: [
        {
          model: Patient,
          attributes: ['firstName', 'lastName'],
        },
      ],
      attributes: ['id', 'time'],
      order: [['time', 'ASC']],
    });

    if (!appointments.length) {
      return resp.makeResponsesOkData(res, [], 'NoAppointmentsToday');
    }

    const formattedAppointments = appointments.map(appointment => ({
      id: appointment.id,
      timeSlot: appointment.time,
      patientName: `${appointment.Patient.firstName} ${appointment.Patient.lastName}`,
    }));

    return resp.makeResponsesOkData(res, formattedAppointments, 'AppointmentsFound');
  } catch (error) {
    console.error(error);
    return resp.makeResponsesError(res, error.message || 'An error occurred');
  }
};

//Reagendar cita por doctor
const rescheduleAppointmentByDoctor = async (req, res) => {
  try {
    const { appointmentId, newDate, newTimeSlot } = req.body;

    // Busca la cita existente
    const appointment = await Appointment.findOne({
      where: { id: appointmentId, deletedAt: null },
    });
    if (!appointment) {
      return resp.makeResponsesError(res, 'AppointmentNotFound');
    }

    const doctorId = appointment.doctorId; // Obtén el doctor directamente de la cita

    // Formatea la nueva fecha como YYYY-MM-DD
    const formattedNewDate = new Date(newDate).toISOString().split('T')[0];

    // Verifica que el doctor tenga disponibilidad en el nuevo horario
    const doctorSchedule = await Schedule.findOne({
      where: { doctorId, timeSlot: newTimeSlot },
    });
    if (!doctorSchedule) {
      return resp.makeResponsesError(res, 'NoScheduleForNewTime');
    }

    // Verifica que no haya otra cita en el nuevo horario
    const existingAppointment = await Appointment.findOne({
      where: {
        doctorId,
        date: formattedNewDate,
        time: newTimeSlot,
      },
    });
    if (existingAppointment) {
      return resp.makeResponsesError(res, 'ScheduleTaken');
    }

    // Actualiza los datos de la cita
    appointment.date = formattedNewDate;
    appointment.time = newTimeSlot;
    appointment.cubicleId = doctorSchedule.cubiclesId; // Actualiza cubículo si es necesario

    await appointment.save();

    return resp.makeResponsesOkData(res, appointment, 'ARescheduled');
  } catch (error) {
    return resp.makeResponsesError(res, error.message || 'Ocurrió un error al reagendar la cita');
  }
};


//Atender cita
const attendAppointment = async (req, res) => {
  try {
    const { appointmentId, results } = req.body;

    // Busca la cita existente
    const appointment = await Appointment.findOne({
      where: { id: appointmentId, deletedAt: null },
    });
    if (!appointment) {
      return resp.makeResponsesError(res, 'AppointmentNotFound');
    }

    // Verifica que la cita esté pendiente
    if (appointment.status !== appointmentStatus.PENDING) {
      return resp.makeResponsesError(res, 'InvalidAppointmentStatus');
    }

    // Marca la cita como atendida y agrega los resultados
    appointment.status = appointmentStatus.ATTENDED;
    appointment.results = results;

    await appointment.save();

    return resp.makeResponsesOkData(res, appointment, 'AppointmentAttended');
  } catch (error) {
    return resp.makeResponsesError(res, error.message || 'Ocurrió un error al marcar la cita como atendida');
  }
};

//Cancelar cita
const cancelAppointment = async (req, res) => {
  try {
    const { appointmentId, doctorId, cancellationReason } = req.body;

    // Busca la cita existente
    const appointment = await Appointment.findOne({
      where: { id: appointmentId, doctorId, deletedAt: null },
    });
    if (!appointment) {
      return resp.makeResponsesError(res, 'AppointmentNotFound');
    }

    // Verifica que la cita esté pendiente
    if (appointment.status !== appointmentStatus.PENDING) {
      return resp.makeResponsesError(res, 'InvalidAppointmentStatus');
    }

    // Marca la cita como cancelada y agrega el motivo
    appointment.status = appointmentStatus.CANCELLED;
    appointment.cancellationReason = cancellationReason;

    await appointment.save();

    // Notifica al paciente (suponiendo que existe un método para notificar)
    await notifyPatient(appointment.patientId, {
      title: 'Cita cancelada',
      message: `Tu cita con el doctor ${doctorId} ha sido cancelada. Motivo: ${cancellationReason}`,
    });

    return resp.makeResponsesOkData(res, appointment, 'AppointmentCancelled');
  } catch (error) {
    return resp.makeResponsesError(res, error.message || 'Ocurrió un error al cancelar la cita');
  }
};

  module.exports = {
    //método del paciente
    getSpecialties,
    getAllDoctorsBySpecialty,
    getAvailableDaysForDoctor,
    getAppointmentsForDoctor,
    getAvailableTimeSlotsForDay,
    bookAppointment,
    getAppointmentsForPatient,

    //métodos dl doctor
    getTodayAppointmentsForDoctor,
    rescheduleAppointmentByDoctor,
    attendAppointment,
    cancelAppointment
  };

