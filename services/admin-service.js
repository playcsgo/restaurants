const { Restaurant, Category, Comment, User, Favorite } = require('../models')

const adminService = {
  getRestaurants: (req, cb) => {
    return Restaurant.findAll({
      raw: true,
      nest: true,
      include: [Category]
    })
    .then(restaurants => cb(null, { restaurants }))
    .catch(err => cb(err))
  }
}

module.exports = adminService
