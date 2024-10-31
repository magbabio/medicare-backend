'use strict'

const express = require('express');
const router = express.Router();

router.use('/specialty', require('./specialtyRoutes'))
router.use('/user', require('./userRoutes'))
router.use('/doctor', require('./doctorRoutes'))
router.use('/cubicle', require('./cubicleRoutes'))
// router.use('/post', require('./postRoutes'))
module.exports = router