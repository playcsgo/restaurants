const express = require('express')
const routes = require('./routes')
const { engine } = require('express-handlebars')
const app = express()
const port = process.env.PORT || 3000
const db = require('./models')


app.engine('hbs', engine({ defaultLayout: 'main', extname: 'hbs' }))
app.set('view engine', 'hbs')
app.use(express.urlencoded({ extended: true }))

app.use(routes)
app.listen(port, () => {
  console.info(`Example app listening on port ${port}!`)
})

module.exports = app
