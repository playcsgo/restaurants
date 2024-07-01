if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const express = require('express')
const { pages, apis } = require('./routes')
const { engine } = require('express-handlebars')
const handlebarsHelpers = require('./helpers/handlebars-helpers')
const app = express()
const port = process.env.PORT || 3000
const db = require('./models')
const flash = require('connect-flash')
const session = require('express-session')
const SESSION_SECRET = 'secret'
const passport = require('./config/passport')
const { getUser } = require('./helpers/auth-helpers')
const methodOverride = require('method-override')
const path = require('path')
const routes = require('./routes')
const cors = require('cors')



app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    preflightContinue: false
  })
)

app.engine('hbs', engine({ defaultLayout: 'main', extname: 'hbs', helpers: handlebarsHelpers }))
app.set('view engine', 'hbs')

app.use(express.json()) 
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'))

app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(flash())
app.use((req, res, next) => {
  res.locals.success_messages = req.flash('success_messages')
  res.locals.error_messages = req.flash('error_messages')
  res.locals.user = getUser(req)
  next()
})
app.use(methodOverride('_method'))
app.use('/upload', express.static(path.join(__dirname, 'upload')))

//GraphQL
const startApolloServer = require('./graphql/apolloServer')
startApolloServer(app).then(() => {
  console.log('Apollo Server started')
}).catch(err => {
  console.error('Error starting Apollo Server:', err)
})


app.use(routes)



app.listen(port, () => {
  console.info(`Express app listening on port ${port}!`)
})

module.exports = app
