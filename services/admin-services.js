const { Restaurant, Category, Comment, User, Favorite } = require('../models')
const { imgurFileHandler } = require('../helpers/file-help')

const adminServices = {
  getRestaurants: (req, cb) => {
    return Restaurant.findAll({
      raw: true,
      nest: true,
      include: [Category]
    })
    .then(restaurants => cb(null, { restaurants }))
    .catch(err => cb(err))
  },
  deleteRestaurant: (req, cb) => {
    return Restaurant.findByPk(req.params.id)
      .then(restaurant => {
        if (!restaurant) throw new Error("Restaurant doesn't exit")
        return restaurant.destroy()
      })
      .then(deletedRestaurant => cb(null, { restaurant: deletedRestaurant }))
      .catch(err => cb(err))
  },
  postRestaurant: (req, cb) => {
    const { name, tel, address, openingHour, description, categoryId } = req.body
    if (!name) throw new Error('Restaurant name is required!')
    const file = req.file
    return imgurFileHandler(file)
      .then(filePath => 
        Restaurant.create({
          name,
          tel,
          address,
          openingHour,
          description,
          image: filePath || null,
          categoryId
        })
      )
      .then(newRestaurant => cb(null, { restaurant: newRestaurant }))
      .catch(err => cb(err))
  },
  putRestaurant: (req, cb) => {
    const { name, tel, address, openingHour, description, categoryId } = req.body
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
      .then(updatedRest => cb(null, { updatedRest }))
      .catch(err => cb(err))
  },
  patchUser: (req, cb) => {
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
      .then(updatedUser => {
        updatedUser = updatedUser.toJSON()
        delete updatedUser.password
        cb(null, { updatedUser })
      })
      .catch(err => cb(err))
  }

}

module.exports = adminServices
