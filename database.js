const mysql = require('mysql')
const util = require('util')
const bcrypt = require('bcrypt')

var db = mysql.createConnection({
  host: 'localhost',
  user: 'node',
  password: 'node',
  database: 'node'
})

db.on('error', (err) => {
  console.log('[SQL Error]', err)
})

query = (statement, params = [], callback = () => null) => {
  if (!util.isArray(params)) {
    params = [params]
  }

  db.query(statement, params, (err, result, fields) => {
    if (err) throw err
    return callback(result)
  })
}

exports.getUsers = (callback) => {
  query(
    'SELECT * FROM users',
    [],
    (r) => callback(r)
  )
}

exports.getUser = (username, callback) => {
  console.log(username)
  query(
    'SELECT * FROM users WHERE username = ?',
    username,
    (r) => callback(r[0])
  )
}

exports.checkPassword = async (user, callback) => {
  this.getUser(user.username, async (r) => {
    if (r == undefined) {
      return callback(false)
    }

    await bcrypt.compare(user.password, r.password, (err, result) => {
      if (err) throw err
      if (result) {
        console.log('User \'' + user.username + '\' logged in.')
      } else {
        console.log('User \'' + user.username + '\' failed to log in.')
      }
      callback(result)
    })
  })
}

exports.createUser = async (user) => {
  this.getUser(user.username, async (result) => {
    if (result == undefined) {
      const hashedPass = await bcrypt.hash(user.password, 10)
      query(
        'INSERT INTO users (username, password) VALUES (?, ?)',
        [user.username, hashedPass]
      )
      console.log('Created user \'' + user.username + '\'')
    } else {
      console.log('User \'' + user.username + '\' already exists!')
    }
  })
}

exports.changePassword = async (user) => {
  this.getUser(user.username, async (result) => {
    if (result == undefined) {
      console.log("This user does not exist!")
    } else {
      const hashedPass = await bcrypt.hash(user.password, 10)
      query(
        'UPDATE users SET password = ? WHERE username = ?',
        [hashedPass, user.username]
      )
      console.log('Changed password for \'' + user.username + '\'')
    }
  })
}