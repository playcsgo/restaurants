const passport = require('passport')
const LocalStrategy = require('passport-local')
const bcrypt = require('bcryptjs')
const db = require('../models')
const User = db.User
// set up Passport strategy
passport.use(new LocalStrategy(
  // customize user field
  {
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
  },
  // authenticate user
  (req, email, password, done) => {
    User.findOne({ where: { email } })
      .then(user => {
        if (!user) return done(null, false, req.flash('error_messages', '帳號或密碼輸入錯誤！'))
        bcrypt.compare(password, user.password).then(isMatch => {
          if (!isMatch) return done(null, false, req.flash('error_messages', '帳號或密碼輸入錯誤！'))
          return done(null, user)
        })
      })
  }
))
// serialize and deserialize user
passport.serializeUser((user, done) => {
  done(null, user.id) //序列化只存id, 減少伺服器記憶體使用
})
passport.deserializeUser((id, done) => {
  User.findByPk(id).then(user => {
    user = user.toJSON()
    return done(null, user)
  })
})

module.exports = passport
