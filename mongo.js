const mongo = require('mongodb').MongoClient
const mongoUrl = 'mongodb://localhost:27017/'

mongo.connect(mongoUrl, { useUnifiedTopology: true, useNewUrlParser: true },
  (err, db) => {
    if (err) throw err
    let dbo = db.db('test')
    let fruits = dbo.collection('fruits')

    fruits.find({}).toArray((err, result) => {
      if (err) throw err
      console.log(result.map(item => [item.name, item.price]))
      db.close()
    })
  }
)
//Port: 27017

// To start mongo:
// sudo systemctl start mongod
