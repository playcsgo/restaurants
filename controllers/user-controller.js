const db = require('../models')
const { User, Comment, Restaurant, Favorite, Like, Followship } = db
const bcrypt = require('bcryptjs')
const { imgurFileHandler } = require('../helpers/file-help')

const userService = require('../services/user-services')


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
    const id = +req.params.id
    let userId
    if (req.user && req.user.id) {
      userId = req.user.id
    }
    return Promise.all([
      User.findByPk(id, {
        include: [
          { model: Comment },
          { model: Restaurant, as: 'FavoritedRestaurants' },
          { model: User, as: 'Followers' },
          { model: User, as: 'Followings' }
        ]
        }),
      Comment.findAll({
        include: Restaurant,
        where: { user_id: id },
        raw: true,
        nest: true
      })
    ])
    .then(([user, comments]) => {
      user = {
        ...user.toJSON(),
        commentsCount: user.Comments && user.Comments.length,
        favoritedCount: user.FavoritedRestaurants && user.FavoritedRestaurants.length,
        followingsCount: user.Followings && user.Followings.length,
        followersCount: user.Followers && user.Followers.length,
        isFollowed: req.user && req.user.Followings.some(f => f.id === user.id)
      }
      const displayRestaurant = new Set()
      comments = comments.filter(comment => {
        if (!displayRestaurant.has(comment.Restaurant.id)) {
          displayRestaurant.add(comment.Restaurant.id)
          return true
        }
        user.commentsCount--
        return false
      })
      res.render('users/profile', {
        user,
        comments,
        userId
      })
    })
    .catch(err => next(err))
  },
  editUser: (req, res, next) => {
    return User.findByPk(req.params.id, { raw: true })
    .then(user => {
      res.render('users/edit', { user })
    })
    .catch(err => next(err))
  },
  putUser: (req, res, next) => {
    const { name } = req.body
    const { file } = req
    return Promise.all([
      User.findByPk(req.params.id),
      imgurFileHandler(file)
    ])
    .then(([user, imagePath]) => {
      return user.update({
        name,
        image: imagePath || user.image
      })
    })
    .then(() => {
      req.flash('success_messages', '使用者資料編輯成功')
      res.redirect(`/users/${req.user.id}`)
    })
    .catch(err => next(err))
  },
  addFavorite: (req, res, next) => {
    userId = req.user.id
    restaurantId = req.params.restaurantId
    return Promise.all([
      Restaurant.findByPk(restaurantId),
      Favorite.findOne({
        where: { userId, restaurantId }
      })
    ])
    .then(([restaurant, favorite]) => {
      if (!restaurant) throw new Error('Restaurant does not exist!') //比較嚴謹 但囉嗦
      if (favorite) throw new Error('You have favorited this restaurant!')
      return Favorite.create({ userId, restaurantId })
    })
    .then(createdFavorite => next(null, { createdFavorite }))
    .catch(err => next(err))
  },
  removeFavorite: (req, res, next) => {
    userId = req.user.id
    restaurantId = req.params.restaurantId
    return Favorite.findOne({ where: { userId, restaurantId } })
    .then(favorite => {
      if (!favorite) throw new Error("You have not favorited this restaurant!")
      return favorite.destroy()
    })
    .then(() => res.redirect('back'))
    .catch(err => next(err))
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
