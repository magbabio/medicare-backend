const express = require('express');
const router = express.Router();

const authRequired = require('../middlewares/authRequired');
const ROLES = require('../constants/roles');

router.use('/admin', authRequired(ROLES.ADMIN));

router.use('/admin/specialty', require('./specialtyRoutes'));
router.use('/admin/doctor', require('./doctorRoutes'));
router.use('/admin/cubicle', require('./cubicleRoutes'));

router.use('/user', require('./userRoutes'));
router.use('/patient', require('./patientRoutes')); //separar en rutas de admin y rutas publicas
router.use('/appointment', require('./appointmentRoutes'));

module.exports = router;
