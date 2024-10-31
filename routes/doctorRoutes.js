const router = require('express').Router();
const doctorController = require('../controllers/doctorController');

// router.get('/specialties', doctorController.getAllSpecialties);
// router.get('/specialties/:id', doctorController.getSpecialty);
router.post('/create', doctorController.createDoctor);
// router.put('/update/:id', doctorController.updateSpecialty);
// router.delete('/delete/:id', doctorController.deleteSpecialty);
// router.get('/deletedSpecialties', doctorController.getAllDeletedSpecialties);

module.exports = router;