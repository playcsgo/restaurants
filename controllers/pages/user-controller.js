const db = require('../../models')
const { User, Comment, Restaurant, Favorite, Like, Followship } = db
const bcrypt = require('bcryptjs')
const { imgurFileHandler } = require('../../helpers/file-help')

const userService = require('../../services/user-services')


const userController = {
  signUpPage: (req, res) => {
    res.render('signup')
  },
  signUp: (req, res, next) => {
    userService.signUp(req, (err, cb) => {
      if (err) return next(err)
      req.flash('success_messages', '註冊成功')
      res.redirect('/signIn')
    })
  },
  signInPage: (req, res) => {
    res.render('signin')
  },
  signIn: (req, res) => {
    req.flash('success_messages', '成功登入')
    res.redirect('/restaurants')
  },
  logout: (req, res) => {
    req.flash('success_messages', '成功登出')
    req.logout()
    res.redirect('/signin')
  },
  getUser: (req, res, next) => {
    userService.getUser(req, (err, data) => err ? next(err) : res.render('users/profile', {
      user: data.user,
      comments: data.comments,
      userId: data.userId
    }))
  },
  editUser: (req, res, next) => {
    return User.findByPk(req.params.id, { raw: true })
    .then(user => {
      res.render('users/edit', { user })
    })
    .catch(err => next(err))
  },
  putUser: (req, res, next) => {
    userService.putUser(req, (err, data) => err ? next(err) :  res.redirect(`/users/${req.user.id}`))
  },
  addFavorite: (req, res, next) => {
    userService.addFavorite(req, (err, data) => err ? next(err) : res.redirect('back'))
  },
  removeFavorite: (req, res, next) => {
    userService.removeFavorite(req, (err, data) => err ? next(err) : res.redirect('back'))
  },
  logout: (req, res, next) => {
    req.logout(() => {
      req.flash('success_messages', '登出成功！')
      res.redirect('/signin')
    })
  },
  addLike: (req, res, next) => {
    userId = req.user.id
    restaurantId = req.params.restaurantId
    return Like.findOne({ where: { userId, restaurantId } })
    .then(like => {
      if (like) throw new Error('Restaurant has been LIKED!')
      return Like.create({ userId, restaurantId })
    })
    .then(() => res.redirect('back'))
    .catch(err => next(err))
  },
  removeLike: (req, res, next) => {
    userId = req.user.id
    restaurantId = req.params.restaurantId
    return Like.findOne({ where: { userId, restaurantId } })
    .then(like => {
      if (!like) throw new Error('Like does not exist')
      like.destroy()
    })
    .then(() => res.redirect('back'))
    .catch(err => next(err))
  },
  getUserTop: (req, res, next) => {
    userService.getUserTop(req, (err, data) => err ? next(err) : res.render('topUsers', { users: data.results }))
  },
  addFollowing: (req, res, next) => {
    userService.addFollowing(req, (err, data) => err ? next(err) : res.redirect('back'))
  },
  removeFollowing: (req, res, next) => {
    userId = req.params.userId
    return Followship.findOne({ where: {
      followerId: req.user.id,
      followingId: req.params.userId
    } })
    .then(followship => {
      if (!followship) throw new Error("You have not FOLLOW this USER!")
      return followship.destroy()
    })
    .then(() => res.redirect('back'))
    .catch(err => next(err))
  },
  logout: (req, res, next) => {
    req.logout(() => {
      req.flash('success_messages', '登出成功！')
      res.redirect('/signin')
    })
  }
}

module.exports = userController 
