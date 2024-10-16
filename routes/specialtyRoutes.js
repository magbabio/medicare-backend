const router = require('express').Router();
const specialtyController = require('../controllers/specialtyController');

router.get('/specialties', getAllSpecialties);
router.get('/specialties/:id', getSpecialty);
router.post('/create', specialtyController.createSpecialty);
router.put('/update', specialtyController.updateSpecialty);
router.delete('/delete', specialtyController.deleteSpecialty);

module.exports = router;