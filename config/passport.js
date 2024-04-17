const passport = require('passport')
const LocalStrategy = require('passport-local')
const FacebookStrategy = require('passport-facebook')
const GoogleStrategy  = require('passport-google-oauth20')
const bcrypt = require('bcryptjs')
const db = require('../models')
const { User, Restaurant } = db

const passportJWT = require('passport-jwt')
const JWTStrategy = passportJWT.Strategy
const ExtractJWT = passportJWT.ExtractJwt
const jwtOptions = {
 jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
 secretOrKey: process.env.JWT_SECRET
}

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

// facebook strategy
passport.use(new FacebookStrategy({
  clientID: process.env.FACKBOOK_ID,
  clientSecret: process.env.FACKBOOK_SECRET,
  callbackURL: process.env.FACEBOOK_CALLBACK,
  profileFields: ['email', 'displayName']
},
function(accessToken, refreshToken, profile, cb) {
  const { name, email } = profile._json
  User.findOne({ where: { email } })
    .then(user => {
      if (user) return cb(null, user)
      const randomPassword = Math.random().toString(36).slice(-8)
      bcrypt
        .genSalt(10)
        .then(salt => bcrypt.hash(randomPassword, salt))
        .then(hash => User.create({
          name,
          email,
          password: hash
        }))
        .then(user => cb(null, user))
        .catch(err => cb(err, false))
    })
}
))

// google-oauth
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK,
},
function(accessToken, refreshToken, profile, cb) {
  const { name, email } = profile._json
  User.findOne({ where: { email } })
    .then(user => {
      if (user) return cb(null, user)
      const randomPassword = Math.random().toString(36).slice(-8)
      bcrypt
        .genSalt(10)
        .then(salt => bcrypt.hash(randomPassword, salt))
        .then(hash => User.create({
          name,
          email,
          password: hash
        }))
        .then(user => cb(null, user))
        .catch(err => cb(err, false))
    })
}
));


// JWT strategy
passport.use(new JWTStrategy(jwtOptions, (jwtPayload, done) => {
  User.findByPk(jwtPayload.id, {
    include: [
      { model: Restaurant, as: 'FavoritedRestaurants'},
      { model: Restaurant, as: 'LikedRestaurants'},
      { model: User, as: 'Followers' },
      { model: User, as: 'Followings' }
    ]
  })
  .then(user => done(null, user)) //JWT 解析出來的就是JSON格式了
  .catch(err => done(err))
}))


// serialize and deserialize user
passport.serializeUser((user, done) => {
  done(null, user.id) //序列化只存id, 減少伺服器記憶體使用
})
passport.deserializeUser((id, done) => {
  User.findByPk(id, {
    include: [
      { model: Restaurant, as: 'FavoritedRestaurants'},
      { model: Restaurant, as: 'LikedRestaurants'},
      { model: User, as: 'Followers' },
      { model: User, as: 'Followings' }
    ]
  })
  .then(user => { return done(null, user.toJSON())})
  .catch(err => done(err))
})

module.exports = passport
