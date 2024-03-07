const { getUser, ensureAuthenticated } = require('../helpers/auth-hlepers')

const authenticated = (req, res, next) => {
  if (ensureAuthenticated(req)) return next()
  res.redirect('/signin')
}
const authenticatedAdmin =(req, res, next) => {
  if (ensureAuthenticated(req)) {
    if (getUser(req).isAdmin) {
      return next()
    }
    res.redirect('/')
  } else res.redirect('/signin')
}

module.exports = {
  authenticated,
  authenticatedAdmin
}
