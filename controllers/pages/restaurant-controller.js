const { Restaurant, Category, Comment, User, Favorite } = require('../../models')
const restaurantService = require('../../services/restaurant-service')

restaurantControllers = {
  getRestaurants: (req, res, next) => {
    restaurantService.getRestaurants(req, (err, data) => err ? next(err) : res.render('restaurants', data))
  },
  getRestaurant: (req, res, next) => {
    const restaurantId = req.params.id

    return Restaurant.findByPk(restaurantId, {
      include: [
        Category,
        { model: Comment, order: [['createdAt', 'DESC']], include: User, },
        { model: User, as: 'FavoritedUsers', raw: true },
        // 找出喜歡這間餐廳的user, 用some看看登入的user在不在裡面, 比map快
        { model: User, as: 'LikedUser', raw: true}
      ]
    })
      .then(restaurant => {
        if (!restaurant) throw new Error('Restaurant does not exist!')
        restaurant.increment('viewCounts')
        const isFavorited = restaurant.FavoritedUsers.some(f => f.id === req.user.id)
        const isLiked = restaurant.LikedUser.some(l => l.id === req.user.id)
        res.render('restaurant', {
          restaurant: restaurant.toJSON(),
          isFavorited,
          isLiked
        })
      })
      .catch(err => next(err))
  },
  getDashboard: (req, res, next) => {
    return Restaurant.findByPk(req.params.id, {
      include: Category,
      raw: true,
      nest: true
    })
    .then(restaurant => {
        res.render('dashboard', {restaurant  })
    })
    .catch(err => next(err))
  },
  getFeeds:  (req, res, next) => {
    return Promise.all([
      Restaurant.findAll({
        limit: 10,
        order: [['createdAt', 'DESC']],
        include: [Category],
        raw: true,
        nest: true
      }),
      Comment.findAll({
        limit: 10,
        order: [['createdAt', 'DESC']],
        include: [User, Restaurant],
        raw: true,
        nest: true
      })
    ])
    .then(([restaurants, comments]) => {
      res.render('feeds', { restaurants, comments })
    })
    .catch(err => next(err))
  },
  getTopRestaurants: (req, res,next) => {
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
      res.render('restaurantsTop', { restaurants: result })
    })
    .catch(err => next(err))
  }
}

module.exports = restaurantControllers
