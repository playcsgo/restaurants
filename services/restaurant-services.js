const { Restaurant, Category, Comment, User, Favorite } = require('../models')
const { getOffset, getPagination } = require('../helpers/pagination-helper')

const restaurantServices = {
  getRestaurants: (req, cb) => {
    const DEFAULT_LIMIT = 9
    const orderMethod = req.query.order || 'DESC'
    const limit = +req.query.limit || DEFAULT_LIMIT
    const page = +req.query.page || 1
    const offset = Math.max(getOffset(limit, page), 0)
    const categoryId = Number(req.query.categoryId) || ''

    return Promise.all([
      Restaurant.findAndCountAll({
        where: { ...categoryId ? { categoryId } : {} },
        include: Category,
        order:[[ 'createdAt', orderMethod ]],
        limit,
        offset,
        raw: true,
        nest: true
      }),
      Category.findAll({ raw: true })
    ]).then(([restaurants, categories ]) => {
      // aa.bb.cc.dd
      // aa && aa.bb && aa.bb.cc && aa.bb.cc.dd && ....
      // aa?.bb?.cc?.dd
      const favoritedRestaurantsId = req.user?.FavoritedRestaurants ? req.user.FavoritedRestaurants.map(fr => fr.id): [] 
      const likedRestaurantsId = req.user?.LikedRestaurants ? req.user.LikedRestaurants.map(lr => lr.id) : []
      const data = restaurants.rows.map(r => ({
        ...r,
        description: r.description && r.description.substring(0, 20),
        isFavorited: favoritedRestaurantsId.includes(r.id),
        isLiked: likedRestaurantsId.includes(r.id)
      }))
      return cb(null, {
        restaurants: data,
        categories,
        categoryId,
        pagination: getPagination(limit, page, restaurants.count)
      })
    })
    .catch(err => cb(err))
  },
  getRestaurant: (req, cb) => {
    const restaurantId = Number(req.params.id)

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
        const isFavorited = restaurant.FavoritedUsers && restaurant.FavoritedUsers.some(f => f.id === req.user.id)
        const isLiked = restaurant.LikedUser && restaurant.LikedUser.some(l => l.id === req.user.id)
        return cb(null, {
          restaurant: restaurant.toJSON(),
          isFavorited,
          isLiked
        })
      })
      .catch(err => cb(err))
  },
  getDashboard: (req, cb) => {
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
        cb(null, { restaurant: result  })
    })
    .catch(err => cb(err))
  },
  getFeeds:  (req, cb) => {
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
      cb(null, { restaurants, comments })
    })
    .catch(err => cb(err))
  },
  getTopRestaurants: (req, cb) => {
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
      cb(null, { restaurants: result })
    })
    .catch(err => cb(err))
  }
  
}

module.exports = restaurantServices
