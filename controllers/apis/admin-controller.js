const adminServices = require('../../services/admin-services')

const adminController = {
  getRestaurants: (req, res, next) => {
    adminServices.getRestaurants(req, (err, data) => err ? next(err) : res.json({ stauts: 'success', data }))
  },
  deleteRestaurant: (req, res, next) => {
    adminServices.deleteRestaurant(req, (err, data) => err ? next(err) : res.json({ stauts: 'success', data }))
  },
  postRestaurant: (req, res, next) => {
    adminServices.postRestaurant(req, (err, data) => {
      err ? next(err) : res.json({ status: 'success', data })
    })
  },
  putRestaurant: (req, res, next) => {
    adminServices.putRestaurant(req, (err, data) => err ? next(err) : res.json({ stauts: 'success', data }))
  },
  patchUser: (req, res, next) => {
    adminServices.patchUser(req, (err, data) => err ? next(err) : res.json({ stauts: 'success', data }))
  }
  
}
  

module.exports = adminController
