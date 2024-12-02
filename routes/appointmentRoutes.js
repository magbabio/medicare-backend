const router = require('express').Router();
const appointmentController = require('../controllers/appointmentController');

router.get('/availableTimeSlots', appointmentController.getAvailableTimeSlotsForDay);
router.post('/bookAppointment', appointmentController.bookAppointment);

module.exports = router;