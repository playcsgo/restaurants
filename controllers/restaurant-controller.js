const { Restaurant, Category, Comment, User, Favorite } = require('../models')
const restaurantServices = require('../services/restaurant-services')

restaurantControllers = {
  getRestaurants: async (req, res, next) => {
    restaurantServices.getRestaurants(req, (err, data) => err ? next(err) : res.render('restaurants', data))
  },
  getRestaurant: (req, res, next) => {
    restaurantServices.getRestaurant(req, (err, data) => err ? next(err) : res.render('restaurant', data ))
  },
  getDashboard: (req, res, next) => {
    return Restaurant.findByPk(req.params.id, {
      include: [
        { model: Category },
        { model: Comment },
        { model: User, as: 'FavoritedUsers' }
      ]
    })
    .then(restaurant => {
      const result = {
        ...restaurant.toJSON(),
        commentCounts: restaurant.Comments && restaurant.Comments.length,
        favoritedCounts: restaurant.FavoritedUsers && restaurant.FavoritedUsers.length
      }
        res.render('dashboard', { restaurant: result  })
    })
    .catch(err => next(err))
  },
  getFeeds:  (req, res, next) => {
    restaurantServices.getFeeds(req, (err, data) => err ? next(err) : res.render('feeds', data))
  },
  getTopRestaurants: (req, res, next) => {
    return Restaurant.findAll({
      include: [
        Category,
        { model: User, as: 'FavoritedUsers' }
      ],
    })
    .then(restaurants => {
      const result = restaurants
        .map(r => ({
          ...r.toJSON(),
          favoritedCount: r.FavoritedUsers.length,
          isFavorited: req.user && req.user.FavoritedRestaurants.some(f => f.id === r.id)
        }))    
        .sort((a,b) => b.favoritedCount - a.favoritedCount)
        .slice(0, 10)
        res.render('restaurantsTop', { restaurants: result } )
    })
    .catch(err => next(err))
  }
}

module.exports = restaurantControllers
