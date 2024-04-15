const express = require('express')
const router = express.Router()

const pages = require('./pages')
const apis = require('./apis')
const auth = require('./auth')

router.use('/api', apis)
router.use('/auth',auth)
router.use('/', pages)


module.exports = router
