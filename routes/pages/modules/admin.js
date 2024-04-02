const express = require('express')
const router = express.Router()

const adminController = require('../../../controllers/pages/admin-controller')
const categoryController = require('../../../controllers/pages/category-controller')
const upload = require('../../../middleware/multer')

router.delete('/categories/:id', categoryController.deleteCategories)
router.get('/categories/:id', categoryController.getCategories)
router.put('/categories/:id', categoryController.putCategories)
router.get('/categories', categoryController.getCategories)
router.post('/categories', categoryController.postCategories)
router.patch('/users/:id', adminController.patchUser)
router.get('/users', adminController.getUsers)
router.get('/restaurants/create', adminController.createRestaurant)
router.get('/restaurants/:id/edit', adminController.editRestaurant)
router.put('/restaurants/:id', upload.single('image'), adminController.putRestaurant)
router.get('/restaurants/:id', adminController.getRestaurant)
router.get('/restaurants', adminController.getRestaurants)
router.delete('/restaurants/:id', adminController.deleteRestaurant)
router.post('/restaurants', upload.single('image'), adminController.postRestaurant)
router.get('/', (req, res) => res.redirect('/admin/restaurants'))

module.exports = router