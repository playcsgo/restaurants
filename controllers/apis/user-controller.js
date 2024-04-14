const jwt = require('jsonwebtoken')
const userService = require('../../services/user-services')

const apiUserController = {
  signIn: (req, res, next) => {
    try {
      const userData = req.user.toJSON()
      delete userData.password
      const token = jwt.sign(userData, process.env.JWT_SECRET, { expiresIn: '7d' })
      res.json({
        status: 'sucess',
        data: {
          token,
          user: userData
        }
      })
    } catch(err) {
      next(err)
    }
  },
  signUp: (req, res, next) => {
    userService.signUp(req, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  },
  addFavorite: (req, res, next) => {
    userService.addFavorite(req, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  },
  removeFavorite: (req, res, next) => {
    userService.removeFavorite(req, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  },
  getUserTop: (req, res, next) => {
    userService.getUserTop(req, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  },
  putUser: (req, res, next) => {
    userService.putUser(req, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  },
  getUser: (req, res, next) => {
    userService.getUser(req, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  },
  addFollowing: (req, res, next) => {
    userService.addFollowing(req, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  },
  removeFollowing: (req, res, next) => {
    userService.removeFollowing(req, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  }
}

module.exports = apiUserController
