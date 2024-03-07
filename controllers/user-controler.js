const db = require('../models')
const { User } = db
const bcrypt = require('bcryptjs')

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
    User.findOne({ where: { email } })
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
  }
}

module.exports = userController  
