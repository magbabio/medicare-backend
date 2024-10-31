const router = require('express').Router();
const specialtyController = require('../controllers/specialtyController');

router.get('/specialties', specialtyController.getAllSpecialties);
router.get('/specialties/:id', specialtyController.getSpecialty);
router.post('/create', specialtyController.createSpecialty);
router.put('/update/:id', specialtyController.updateSpecialty);
router.delete('/delete/:id', specialtyController.deleteSpecialty);
router.get('/deletedSpecialties', specialtyController.getAllDeletedSpecialties);

module.exports = router;