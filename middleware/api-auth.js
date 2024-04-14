const passport = require('../config/passport')

// const authenticated = passport.authenticate('jwt', { session: false })

const authenticated = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err || !user) return res.status(401).json({ status: 'error', message: 'unauthorized by api-auth' })
    req.user = user
    next()
  })(req, res, next)
}


const authenticatedAdmin = (req, res, next) => {
  if (req.user && req.user.isAdmin) return next()
  return res.status(403).json({ status: 'error', message: 'permission denied by api-auth' })
}

module.exports = {
  authenticated,
  authenticatedAdmin
}
