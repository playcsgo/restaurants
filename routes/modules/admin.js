const express = require('express')
const router = express.Router()
const adminrestController = require('../../controllers/admin-controller')

router.get('/restaurants', adminrestController.getRestaurants)
router.use('/', (req, res) => res.redirect('/admin/restaurants'))

module.exports = router
