const { User, Restaurant, Category } = require('../models')
const { imgurFileHandler } = require('../helpers/file-help')


const adminController = {
  getRestaurants: (req, res, next) => {
    return Restaurant.findAll({
      raw: true,
      nest: true,
      include: [Category]
    })
    .then(restaurants => {
      res.render('admin/restaurants', { restaurants })
    })
    .catch(err => next(err))
  },
  createRestaurant: (req, res, next) => {
    Category.findAll({
      raw: true
    })
      .then(categories => res.render('admin/create-restaurant', { categories }))
      .catch(err => next(err))
  },
  postRestaurant: (req, res, next) => {
    const { name, tel, address, openingHour, description, categoryId } = req.body
    if (!name) throw Error('Restaurant name is required!')
    const file = req.file
    return imgurFileHandler(file)
      .then(filePath => {
        Restaurant.create({
          name,
          tel,
          address,
          openingHour,
          description,
          image: filePath || null,
          categoryId
        })
      })
      .then(() => {
        req.flash('success_messages', 'restaurant was successfully created')
        res.redirect('/admin/restaurants')
      })
      .catch(err => next(err))
  },
  getRestaurant: (req, res, next) => {
    return Restaurant.findByPk(req.params.id, {
      // raw: true,
      // nest: true,
      include: [Category]
    })
      .then(restaurant => {
        if (!restaurant) throw Error('Restaurant is not found')
        res.render('admin/restaurant', { restaurant: restaurant.toJSON() })
      })
      .catch(err => next(err))
  },
  editRestaurant: (req, res, next) => {
    Promise.all([
      Restaurant.findByPk(req.params.id, { raw: true }),
      Category.findAll({ raw: true})
    ])
      .then(([restaurant, categories]) => {
        if (!restaurant) throw new Error("Restaurant doesn't esist!")
        res.render('admin/edit-restaurant', { restaurant, categories })
      })
      .catch(err => next(err))
  },
  putRestaurant: (req, res, next) => {
    const { name, tel, address, openingHour, description, categoryId } = req.body
    console.log(req.body)
    if (!name) throw Error('Restaurant name is required!')

    const { file } = req

    return Promise.all([
      Restaurant.findByPk(req.params.id),
      imgurFileHandler(file)
    ])
      .then(([restaurant, filePath]) => {
        if (!restaurant) throw new Error("Restaurant doesn't exit")
        return restaurant.update({
          name,
          tel,
          address,
          openingHour,
          description,
          image: filePath || restaurant.image,
          categoryId
        })
      })
      .then(() => {
        req.flash('success_messages', 'restaurant was successfully updated')
        res.redirect('/admin/restaurants')
      })
      .catch(err => next(err))
  },
  deleteRestaurant: (req, res, next) => {
    return Restaurant.findByPk(req.params.id)
      .then(restaurant => {
        if (!restaurant) throw new Error("Restaurant doesn't exit")
        return restaurant.destroy()
      })
      .then(() => {
        
        res.redirect('/admin/restaurants')
      })
      .catch(err => next(err))
  },
  getUsers: (req, res, next) => {
    return User.findAll({ raw: true })
      .then(users => {
        res.render('admin/users', { users })
      })
      .catch(err => next(err))
  },
  patchUser: (req, res, next) => {
    const id = req.params.id
    return User.findByPk(id)
      .then(user => {
        if (!user) throw new Error('奇怪, 沒這人?')
        if (user.email === 'root@example.com') {
          req.flash('error_messages', '禁止變更 root 權限')
          return res.redirect('back')
        }
        return user.update({ isAdmin: !user.isAdmin })
      })
      .then(() => {
        req.flash('success_messages', '使用者權限變更成功')
        res.redirect('/admin/users')
      })
      .catch(err => next(err))
  }
}

module.exports = adminController
