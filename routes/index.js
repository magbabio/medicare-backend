'use strict'

const express = require('express');
const router = express.Router();

const authRequired = require('../middlewares/authRequired');
const ROLES = require('../constants/roles');

router.use('/admin/specialty',require('./specialtyRoutes'));
router.use('/user', require('./userRoutes'))
router.use('/admin/doctor',require('./doctorRoutes'));
router.use('/admin/cubicle',require('./cubicleRoutes'));
router.use('/patient', require('./patientRoutes'))

router.use('/admin',authRequired(ROLES.ADMIN))

module.exports = router