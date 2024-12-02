const router = require('express').Router();
const cubicleController = require('../controllers/cubicleController');

//router.get('/cubicles', authRequired(constant.admin), cubicleController.getAllCubicles);
router.get('/cubicles', cubicleController.getAllCubicles);
router.get('/cubicles/:id', cubicleController.getCubicle);
router.post('/create', cubicleController.createCubicle);
router.put('/update/:id', cubicleController.updateCubicle);
router.delete('/delete/:id', cubicleController.deleteCubicle);
router.get('/deletedCubicles', cubicleController.getAllDeletedCubicles);
router.put('/activate/:id', cubicleController.activateCubicle);
router.post('/assign', cubicleController.assignDoctorToCubicle);
router.get('/schedule/:cubiclesId', cubicleController.getCubicleSchedule);

module.exports = router;