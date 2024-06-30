const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

let bodyParser = require('body-parser')

//Database connection
const uri =
  "mongodb+srv://tusharbajajtb:" +
  process.env.PW +
  "@demodb.2pjeker.mongodb.net/db1?retryWrites=true&w=majority&appName=DemoDB";
const mongoose = require("mongoose");
mongoose.connect(uri, { /*useNewUrlParser: true, useUnifiedTopology: true */});

let ExerciseSchema = new mongoose.Schema({
  description: {type: String, required: true},
  duration: {type: Number, required: true},
  date: String,
})

let UserSchema = new mongoose.Schema({
  username: {type: String, required: true},
  log: [ExerciseSchema],
})

let Exercise = mongoose.model('Exercise', ExerciseSchema)
let User = mongoose.model('User', UserSchema)

app.post('/api/users', bodyParser.urlencoded({extended: false}), (req, res) => {
  let newUser = new User({username: req.body.username})
  newUser.save()
  .then(savedUser => {
    res.json({username: savedUser.username, _id: savedUser.id})
  })
  .catch(err => {
    res.json({err})
  })
})

app.get('/api/users', (req, res) => {
  User.find({})
  .then(arrayOfUsers => {
    res.json(arrayOfUsers)
  })
  .catch(err => {
    res.json({err})
  })
})

app.post('/api/users/:_id/exercises', bodyParser.urlencoded({extended: false}), async (req, res) => {
  
  let newExercise = new Exercise({
    description: req.body.description,
    duration: parseInt(req.body.duration),
    date: req.body.date,
  })

  if(newExercise.date === '') {
    newExercise.date = new Date().toISOString().substring(0,10)
  }
  User.findByIdAndUpdate(
    req.params._id,
    {$push: {log: newExercise}},
    {new: true}
  )
  .then(updatedUser => {
    // const exercise = newExercise.save()
    console.log(exercise)
    res.json({_id: updatedUser._id, username: updatedUser.username, date: new Date(newExercise.date).toDateString(), description: updatedUser.description, duration: updatedUser.duration})
  })
  .catch(err => {
    res.json({err})
  })
})

app.get('/api/users/:_id/logs', (req, res) => {
  User.findById(req.params._id)
  .then(result => {
    // console.log(result.log.length)
    let responseObject = result

    if(req.query.from || req.query.to) {
      let fromDate = new Date(0)
      let toDate = new Date()

      if(req.query.from) {
        fromDate = new Date(req.query.from)
      }

      if(req.query.to) {
        fromDate = new Date(req.query.to)
      }

      fromDate = fromDate.getTime()
      toDate = toDate.getTime()

      responseObject.log = responseObject.log.filter((Exercise) => {
        let ExerciseDate = new Date(Exercise.date).getTime()

        return ExerciseDate >= fromDate && ExerciseDate <= toDate
      })
    }

    if(req.query.limit) {
      responseObject.log = responseObject.log.slice(0, req.query.limit)
    }

    // responseObject["count"] = result.log.length
    let log = responseObject.log
    res.json({username: responseObject.username, count: result.log.length, _id: responseObject.id, log})
  })
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
