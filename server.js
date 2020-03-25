const express = require('express')
const session = require('express-session')
const db = require('./database')
const app = express()

app.use('/static', express.static('public'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}))

app.set('view engine', 'ejs')

// Home page
app.get('/', (req, res) => {
  res.render('pages/index', {user: req.session.user})
})

// Debug
app.get('/listUsers', (req, res) => {
  db.getUsers((r) => {
    res.json(r)
  })
})


// Register
app.get('/register', (req, res) => {
  if (!req.session.user) {
    res.render('pages/register', {user: req.session.user, message: ''})
  } else {
    res.render('pages/permissionError', {loggedIn: true, page: 'register'})
  }
})

app.post('/register', async (req, res) => {
  user = {
    username: req.body.user.username || '',
    password: req.body.user.password || ''
  }

  if (user.username != '' && user.password != '') {
    await db.createUser(user)
  }

  res.render('pages/register', {user: req.session.user, message: 'you were registered'})
})


// Login
app.get('/login', (req, res) => {
  if (!req.session.user) {
    res.render('pages/login', {user: req.session.user, message: ''})
  } else {
    res.render('pages/permissionError', {loggedIn: true, page: 'login'})
  }
})

app.post('/login', async (req, res) => {
  user = {
    username: req.body.user.username || '',
    password: req.body.user.password || ''
  }

  await db.checkPassword(user, (check) => {
    var m = check ? 'You have logged in' : 'Login failed'
    if (check) {
      req.session.user = user
      req.session.save()
    }
    res.render('pages/login', {user: req.session.user, message: m})
  })
})

// Signout
app.get('/signout', (req, res) => {
  req.session.user = null
  res.redirect('/login')
})

//Change password

app.post('/changePassword', async (req, res) => {
  user = {
    username: req.body.username || '',
    password: req.body.password || ''
  }

  await db.changePassword(user)
  res.send('Password changed!')
})

app.listen(8080)