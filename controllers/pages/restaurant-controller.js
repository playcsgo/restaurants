const { Restaurant, Category, Comment, User, Favorite } = require('../../models')
const { getOffset, getPagination } = require('../../helpers/pagination-helper')

restaurantControllers = {
  getRestaurants: (req, res, next) => {
    const DEFAULT_LIMIT = 9
    const limit = +req.query.limit || DEFAULT_LIMIT
    const page = +req.query.page || 1
    const offset = Math.max(getOffset(limit, page), 0)
    const categoryId = Number(req.query.categoryId) || ''

    return Promise.all([
      Restaurant.findAndCountAll({
        where: { ...categoryId ? { categoryId } : {} },
        include: Category,
        limit,
        offset,
        raw: true,
        nest: true
      }),
      Category.findAll({ raw: true })
    ]).then(([restaurants, categories ]) => {
      const favoritedRestaurantsId = req.user.FavoritedRestaurants.map(fr => fr.id)
      const likedRestaurantsId = req.user.LikedRestaurants.map(lr => lr.id)
      const data = restaurants.rows.map(r => ({
        ...r,
        description: r.description.substring(0, 20),
        isFavorited: favoritedRestaurantsId.includes(r.id),
        isLiked: likedRestaurantsId.includes(r.id)
      }))
      return res.render('restaurants', {
        restaurants: data,
        categories,
        categoryId,
        pagination: getPagination(limit, page, restaurants.count)
      })
    })
    .catch(err => next(err))
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
