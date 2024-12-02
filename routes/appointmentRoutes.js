const router = require('express').Router();
const appointmentController = require('../controllers/appointmentController');

router.get('/doctorsBySpecialty', appointmentController.getAllDoctorsBySpecialty);
router.get('/availableDays', appointmentController.getAvailableDaysForDoctor);
router.get('/pendingAppts/:id', appointmentController.getPendingAppointmentsForDoctor);
router.get('/availableTimeSlots', appointmentController.getAvailableTimeSlotsForDay);
router.post('/bookAppointment', appointmentController.bookAppointment);

module.exports = router;