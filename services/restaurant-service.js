const { Restaurant, Category, Comment, User, Favorite } = require('../models')
const { getOffset, getPagination } = require('../helpers/pagination-helper')

const restaurantService = {
  getRestaurants: (req, cb) => {
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
      // aa.bb.cc.dd
      // aa && aa.bb && aa.bb.cc && aa.bb.cc.dd && ....
      // aa?.bb?.cc?.dd
      const favoritedRestaurantsId = req.user?.FavoritedRestaurants ? req.user.FavoritedRestaurants.map(fr => fr.id): [] 
      const likedRestaurantsId = req.user?.LikedRestaurants ? req.user.LikedRestaurants.map(lr => lr.id) : []
      const data = restaurants.rows.map(r => ({
        ...r,
        description: r.description.substring(0, 20),
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
  }
}

module.exports = restaurantService
