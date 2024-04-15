const db = require('../models')
const { User, Comment, Restaurant, Favorite, Like, Followship } = db
const bcrypt = require('bcryptjs')
const { imgurFileHandler } = require('../helpers/file-help')

const userService = {
  signUp: (req, cb) => {
    const { name, email, password, passwordCheck} = req.body
    if (password !== passwordCheck) {
      console.log('密碼不對')
      throw new Error('Passwords do NOT match!')
    }
    return User.findOne({ where: { email } })
      .then(user => {
        if (user) {
          console.log('此信箱已被使用')
          throw new Error('Email already exists')
        }
        return bcrypt.hash(password, 10)
      })
      .then(hash => User.create({
        name,
        email,
        password: hash
      }))
      .then(newUser => {
        newUser = newUser.toJSON()
        delete newUser.password
        cb(null, { user: newUser })
      })
      .catch(err => cb(err))
  },
  addFavorite: (req, cb) => {
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
    .then(createdFavorite => cb(null, { createdFavorite }))
    .catch(err => cb(err))
  },
  removeFavorite: (req, cb) => {
    userId = req.user.id
    restaurantId = req.params.restaurantId
    return Favorite.findOne({ where: { userId, restaurantId } })
    .then(favorite => {
      if (!favorite) throw new Error("You have not favorited this restaurant!")
      return favorite.destroy()
    })
    .then(removedFavorite => cb(null, { removedFavorite }))
    .catch(err => cb(err))
  },
  getUserTop: (req, cb) => {
    return User.findAll({
      include: [ { model: User, as: 'Followers' } ],
    })
    .then(users => {
      const results = users
      .map(user => ({
        ...user.toJSON(),
        followerCount: user.Followers.length,
        isFollowed: req.user.Followings.some(FollowingUser => FollowingUser.id === user.id)
      }))
      .sort((a,b) => b.followerCount - a.followerCount)
      return cb(null, { results })
    })
    .catch(err => cb(err))
  },
  putUser: (req, cb) => {
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
    .then(updatedUser => {
      req.flash('success_messages', '使用者資料編輯成功')
      return cb(null, { updatedUser })
    })
    .catch(err => cb(err))
  },
  getUser: (req, cb) => {
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

      cb(null, { user, comments, userId })
    })
    .catch(err => cb(err))
  },
  addFollowing: (req, cb) => {
    const followerId = +req.user.id
    const followingId = +req.params.userId
    return Promise.all([
      User.findByPk(req.params.userId),
      Followship.findOne({
        where: { followerId, followingId }
      })
    ])
    .then(([user, followship]) => {
      if (!user) throw new Error('user does not exist!')
      if (followship) throw new Error('user has been followed!')
      return Followship.create({ 
        followerId,
        followingId })
    })
    .then(followship => {
      cb(null, { followship })
    })
    .catch(err => cb(err))
  },
  removeFollowing: (req, cb) => {
    userId = req.params.userId
    return Followship.findOne({ where: {
      followerId: req.user.id,
      followingId: req.params.userId
    } })
    .then(followship => {
      if (!followship) throw new Error("You have not FOLLOW this USER!")
      return followship.destroy()
    })
    .then(removedFollowship => cb(null, { removedFollowship }))
    .catch(err => cb(err))
  },
  logout: (req, res, next) => {
    req.logout(() => {
      req.flash('success_messages', '登出成功！')
      res.redirect('/signin')
    })
  }
}

module.exports = userService