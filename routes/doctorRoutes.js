const router = require('express').Router();
const doctorController = require('../controllers/doctorController');

router.get('/doctors', doctorController.getAllDoctors);
router.get('/doctors/:id', doctorController.getDoctor);
router.post('/create', doctorController.createDoctor);
router.put('/update/:id', doctorController.updateDoctor);
router.delete('/delete/:id', doctorController.deleteDoctor);
router.get('/deletedDoctors', doctorController.getAllDeletedDoctors);
router.put('/activate/:id', doctorController.activateDoctor);

module.exports = router;