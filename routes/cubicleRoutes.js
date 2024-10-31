const router = require('express').Router();
const cubicleController = require('../controllers/cubicleController');

router.get('/cubicles', cubicleController.getAllCubicles);
router.get('/cubicles/:id', cubicleController.getCubicle);
router.post('/create', cubicleController.createCubicle);
router.put('/update/:id', cubicleController.updateCubicle);
router.delete('/delete/:id', cubicleController.deleteCubicle);
router.get('/deletedCubicles', cubicleController.getAllDeletedCubicles);

module.exports = router;