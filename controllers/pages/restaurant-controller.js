const { Restaurant, Category, Comment, User, Favorite } = require('../../models')
const restaurantServices = require('../../services/restaurant-services')

restaurantControllers = {
  getRestaurants: (req, res, next) => {
    restaurantServices.getRestaurants(req, (err, data) => err ? next(err) : res.render('restaurants', data))
  },
  getRestaurant: (req, res, next) => {
    restaurantServices.getRestaurant(req, (err, data) => err ? next(err) : res.render('restaurant', data ))
  },
  getDashboard: (req, res, next) => {
    restaurantServices.getDashboard(req, (err, data) => err ? next(err) : res.render('dashboard', data))
  },
  getFeeds:  (req, res, next) => {
    restaurantServices.getFeeds(req, (err, data) => err ? next(err) : res.render('feeds', data))
  },
  getTopRestaurants: (req, res,next) => {
    restaurantServices.getTopRestaurants(req, (err, data) => err ? next(err) : res.render('restaurantsTop', data ))
  }
}

module.exports = restaurantControllers
