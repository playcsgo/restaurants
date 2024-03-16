const { Restaurant, Category } = require('../models')

restaurantControllers = {
  getRestaurants: (req, res, next) => {
    const categoryId = Number(req.query.categoryId) || ''

    return Promise.all([
      Restaurant.findAll({
        where: { ...categoryId ? { categoryId } : {} },
        include: Category,
        raw: true,
        nest: true
      }),
      Category.findAll({ raw: true })
    ]).then(([restaurants, categories ]) => {
      const data = restaurants.map(r => ({
        ...r,
        description: r.description.substring(0, 20)
      }))
      return res.render('restaurants', {
        restaurants: data, 
        categories,
        categoryId
      })
    })
    .catch(err => next(err))
  },
  getRestaurant: (req, res, next) => {
    return Restaurant.findByPk(req.params.id, {
      include: Category
    })
      .then(restaurant => {
        if (!restaurant) throw new Error('Restaurant does not exist!')
        return restaurant.increment('viewCounts')
      })
      .then(restaurant => res.render('restaurant', { restaurant: restaurant.toJSON() }))
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
  }
}

module.exports = restaurantControllers
