const express = require('express')
const router = express.Router()
const admin = require('./module/admin')

const restController = require('../../controllers/apis/restaurant-controller')
const adminController = require('../../controllers/apis/admin-controller')

// admin
router.use('/admin', admin)

// restaurant
router.get('/restaurants', restController.getRestaurants)



module.exports = router