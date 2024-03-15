const { Restaurant, Category } = require('../models')

restaurantControllers = {
  getRestaurants: (req, res, next) => {
    Restaurant.findAll({
      include: Category,
      raw: true,
      nest: true
    }).then(restaurants => {
      const data = restaurants.map(r => ({
        ...r,
        description: r.description.substring(0, 20)
      }))
      return res.render('restaurants', {restaurants: data})
    })
  }
}

module.exports = restaurantControllers
