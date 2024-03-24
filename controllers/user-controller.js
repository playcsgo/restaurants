const db = require('../models')
const { User, Comment, Restaurant, Favorite, Like } = db
const bcrypt = require('bcryptjs')
const { imgurFileHandler } = require('../helpers/file-help')

const userController = {
  signUpPage: (req, res) => {
    res.render('signup')
  },
  signUp: (req, res, next) => {
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
      .then(() => {
        req.flash('success_messages', '註冊成功')
        res.redirect('/signin')
      })
      .catch(err => next(err))
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
    const id = req.params.id || req.user.id
    return Promise.all([
      User.findByPk(id, { raw: true }),
      Comment.findAndCountAll({
        where: {user_id: id},
        include: [Restaurant],
        raw: true,
        nest: true
      })
    ])
    .then(([user, comments]) => {
      return res.render('users/profile', { user, comments })
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
    restaurantId = req.params.id
    return Promise.all([
      Restaurant.findByPk(restaurantId),
      Favorite.findOne({
        where: { userId, restaurantId }
      })
    ])
    .then(([restaurant, favorite]) => {
      if (!restaurant) throw new Error('Restaurant does not exist!') //比較嚴謹 但囉嗦
      if (favorite) throw new Error('You have favorited this restaurant!')
      return Favorite.create({ userId, restaurantId})
    })
    .then(() => res.redirect('back'))
    .catch(err => next(err))
  },
  removeFavorite: (req, res, next) => {
    userId = req.user.id
    restaurantId = req.params.id
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
  }
}

module.exports = userController 
