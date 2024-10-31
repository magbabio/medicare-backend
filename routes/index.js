'use strict'

const express = require('express');
const router = express.Router();

router.use('/specialty', require('./specialtyRoutes'))
router.use('/user', require('./userRoutes'))
// router.use('/comment', require('./commentRoutes'))
// router.use('/post', require('./postRoutes'))
module.exports = router