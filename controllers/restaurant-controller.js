const { Restaurant, Category, Comment, User } = require('../models')
const { getOffset, getPagination } = require('../helpers/pagination-helper')

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
      const data = restaurants.rows.map(r => ({
        ...r,
        description: r.description.substring(0, 20)
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
    return Promise.all([
      Restaurant.findByPk(restaurantId, { include: [Category] }),
      Comment.findAll({
        where: { restaurantId },
        include: [ User ],
        order: [[ 'createdAt', 'DESC' ]], 
        raw: true,
        nest: true
      })
    ])
      .then(([restaurant, comments]) => {
        if (!restaurant) throw new Error('Restaurant does not exist!')
        restaurant.increment('viewCounts')
        res.render('restaurant', { restaurant: restaurant.toJSON(), comments })
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
  }
}

module.exports = restaurantControllers
