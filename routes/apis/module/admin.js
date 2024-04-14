const express = require('express')
const router = express.Router()

const upload = require('../../../middleware/multer')
const apiAdminController = require('../../../controllers/apis/admin-controller')
const apiCategoryController = require('../../../controllers/apis/category-controller')


router.post('/restaurants', upload.single('image'), apiAdminController.postRestaurant)
router.delete('/restaurants/:id', apiAdminController.deleteRestaurant)
router.get('/restaurants', apiAdminController.getRestaurants)
router.put('/restaurants/:id', upload.single('image'), apiAdminController.putRestaurant)

router.patch('/users/:id', apiAdminController.patchUser)

router.delete('/categories/:id', apiCategoryController.deleteCategories)
router.put('/categories/:id', apiCategoryController.putCategories)
router.get('/categories', apiCategoryController.getCategories)
router.post('/categories', apiCategoryController.postCategories)

module.exports = router