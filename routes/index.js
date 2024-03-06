const express = require('express')
const router = express.Router()
const restController = require('../controllers/restaurant-controller.js')
const admin = require('./modules/admin')

router.use('/admin', admin)

router.get('/restaurants', restController.getRestaurants)
router.use('/', (req, res) => res.redirect('/restaurants'))

module.exports = router
