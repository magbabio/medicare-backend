const router = require('express').Router();
const appointmentController = require('../controllers/appointmentController');

router.get('/getSpecialties', appointmentController.getSpecialties);
router.get('/doctorsBySpecialty', appointmentController.getAllDoctorsBySpecialty);
router.get('/availableDays', appointmentController.getAvailableDaysForDoctor)

// http://localhost:4000/api/appointment/pendingAppts/:id?status=10 cambiar nombre del endpoint y el status va a cambiar

router.get('/availableTimeSlots', appointmentController.getAvailableTimeSlotsForDay);
router.post('/bookAppointment', appointmentController.bookAppointment);

router.get('/getPatientAppts/:id', appointmentController.getAppointmentsForPatient); // pasar parametros

//rutas del doctor
router.get('/getAppts/:id', appointmentController.getAppointmentsForDoctor); // pasar parametros
router.post('/rescheduleAppointmentByDoctor', appointmentController.rescheduleAppointmentByDoctor);
router.post('/attendAppointment', appointmentController.attendAppointment);
router.post('/cancelAppointment', appointmentController.cancelAppointment);

router.get('/getTodayAppts', appointmentController.getTodayAppointmentsForDoctor)
router.get('/getAppointmentById/:id', appointmentController.getAppointmentById);

module.exports = router;