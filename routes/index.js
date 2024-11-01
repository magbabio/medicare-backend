'use strict'

const express = require('express');
const router = express.Router();

router.use('/specialty', require('./specialtyRoutes'))
router.use('/user', require('./userRoutes'))
router.use('/doctor', require('./doctorRoutes'))
//router.use('/admin/doctor', require('./doctorRoutes'))
router.use('/cubicle', require('./cubicleRoutes'))
router.use('/patient', require('./patientRoutes'))
//router.use('/admin',authRequired(admin))
module.exports = router