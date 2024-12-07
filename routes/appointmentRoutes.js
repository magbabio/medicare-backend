const router = require('express').Router();
const appointmentController = require('../controllers/appointmentController');

router.get('/getSpecialties', appointmentController.getSpecialties);
router.get('/doctorsBySpecialty', appointmentController.getAllDoctorsBySpecialty);
router.get('/availableDays', appointmentController.getAvailableDaysForDoctor);

router.get('/pendingAppts/:id', appointmentController.getPendingAppointmentsForDoctor); // pasar parametros

// http://localhost:4000/api/appointment/pendingAppts/:id?status=10 cambiar nombre del endpoint y el status va a cambiar

router.get('/availableTimeSlots', appointmentController.getAvailableTimeSlotsForDay);
router.post('/bookAppointment', appointmentController.bookAppointment);

module.exports = router;