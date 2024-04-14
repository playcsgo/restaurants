const express = require('express')
const router = express.Router()
const admin = require('./module/admin')
const passport = require('../../config/passport')
const { apiErrorHandler } = require('../../middleware/error-handler')
const { authenticated, authenticatedAdmin } = require('../../middleware/api-auth')
const upload = require('../../middleware/multer')

const apiRestController = require('../../controllers/apis/restaurant-controller')
const apiUserController = require('../../controllers/apis/user-controller')
const apiCommentController = require('../../controllers/apis/comment-controller')


// admin
router.use('/admin', authenticated, authenticatedAdmin, admin)

// restaurant
router.get('/restaurants/top', authenticated, apiRestController.getTopRestaurants)
router.get('/restaurants/feeds', authenticated, apiRestController.getFeeds )
router.get('/restaurants/:id/dashboard', authenticated, apiRestController.getDashboard)
router.get('/restaurants/:id', authenticated, apiRestController.getRestaurant)
router.get('/restaurants', authenticated, apiRestController.getRestaurants)

// user
router.get('/users/top', authenticated, apiUserController.getUserTop)
router.get('/users/:id', authenticated, apiUserController.getUser)
router.put('/users/:id', authenticated, upload.single('image'), apiUserController.putUser)

// signIn signUp
router.post('/signin', passport.authenticate('local', { session: false }), apiUserController.signIn)
router.post('/signup', apiUserController.signUp)

// comment
router.delete('/comments/:id', authenticated, authenticatedAdmin, apiCommentController.deleteComment)
router.post('/comments', authenticated, apiCommentController.postComment)

// favorite
router.post('/favorites/:restaurantId', authenticated, apiUserController.addFavorite)
router.delete('/favorites/:restaurantId', authenticated, apiUserController.removeFavorite)

// following
router.post('/following/:userId', authenticated, apiUserController.addFollowing)
router.delete('/following/:userId', authenticated, apiUserController.removeFollowing)

router.use('/', apiErrorHandler)

module.exports = router