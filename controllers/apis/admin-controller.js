const adminService = require('../../services/admin-service')

const adminController = {
  getRestaurants: (req, res, cb) => {
    adminService.getRestaurants(req, (err, data) => err ? next(err) : res.json(data))
  },
}
  

module.exports = adminController
