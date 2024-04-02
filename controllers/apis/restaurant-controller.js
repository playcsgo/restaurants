const { Restaurant, Category, Comment, User, Favorite } = require('../../models')
const { getOffset, getPagination } = require('../../helpers/pagination-helper')
const restaurantService = require('../../services/restaurant-service')

restaurantControllers = {
  getRestaurants: (req, res, next) => {
    restaurantService.getRestaurants(req, (err, data) => err ? next(err) : res.json(data))
  }
}

module.exports = restaurantControllers
