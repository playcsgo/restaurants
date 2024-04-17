const express = require('express')
const router = express.Router()
const passport = require('passport')

// facebook
router.get('/facebook/callback', passport.authenticate('facebook', {
  successRedirect: '/',
  failureRedirect: '/signin'
}))
router.get('/facebook', passport.authenticate('facebook', {
  scope: ['email', 'public_profile']
}))


// google
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}))

router.get('/google/callback', passport.authenticate('google', {
  successRedirect: '/',
  failureRedirect: '/signin'
}))



module.exports = router
