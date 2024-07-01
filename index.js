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

app.post('/api/users/:_id/exercises', bodyParser.urlencoded({extended: false}), (req, res) => {
  
  let newExercise = new Exercise({
    description: req.body.description,
    duration: parseInt(req.body.duration),
    date: req.body.date ? req.body.date : new Date().toISOString().substring(0,10),
  })


  User.findByIdAndUpdate(
    req.params._id,
    {$push: {log: newExercise}},
    {new: true}
  )

  .then(updatedUser => {
    
    const date = new Date(newExercise.date)
    const user = {_id: req.params._id, username: updatedUser.username, date: date.toDateString(), duration: Number(newExercise.duration), description: newExercise.description}

    res.json(user)
  })
  .catch(err => {
    res.json({err})
  })

})

app.get('/api/users/:_id/logs', (req, res) => {
  User.findById(req.params._id)
  .then(result => {
    let responseObject = result

    if(req.query.from || req.query.to) {
      let fromDate = new Date(0)
      let toDate = new Date()

      if(req.query.from) {
        fromDate = new Date(req.query.from)
      }

      if(req.query.to) {
        toDate = new Date(req.query.to)
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

    

    let log = responseObject.log.map(e => ({
      description: e.description,
      duration: e.duration,
      date: (new Date(e.date)).toDateString()
    }))
  
    res.json({_id: responseObject.id, username: responseObject.username, count: result.log.length, log})
  })
})


// let ExerciseSchema = new mongoose.Schema({
//   username: {type: String, required: true},
//   description: {type: String, required: true},
//   duration: {type: Number, required: true},
//   date: String,
// })

// let UserSchema = new mongoose.Schema({
//   username: {type: String, required: true}
// })

// const User = mongoose.model('User', UserSchema)
// const Exercise = mongoose.model('Exercise', ExerciseSchema)

// app.post('/api/users', bodyParser.urlencoded({extended: false}), (req, res) => {
//     let newUser = new User({username: req.body.username})
//     newUser.save()
//     .then(savedUser => {
//       res.json({username: savedUser.username, _id: savedUser.id})
//     })
//     .catch(err => {
//       res.json({err})
//     })
//   })
  
//   app.get('/api/users', (req, res) => {
//     User.find({})
//     .then(arrayOfUsers => {
//       res.json(arrayOfUsers)
//     })
//     .catch(err => {
//       res.json({err})
//     })
//   })

//   app.post('/api/users/:_id/exercises', (req, res) => {
//     User.findById(req.params._id)
//     .then(result => {
//       console.log(result)
//       const exerciseObj = new Exercise({
//         username: result.username,
//         description: req.body.description,
//         duration: req.body.duration,
//         date: req.body.date ? new Date(req.body.date) : new Date()
//       })

//       const exercise = exerciseObj.save()
//       console.log(exercise)
//         res.json({
//           _id: result._id,
//           username: result.username,
//           description: exerciseObj.description,
//           duration: exerciseObj.duration,
//           date: new Date(exerciseObj.date).toDateString()
//         })
//     })
//     .catch(err => {
//       res.json(err)
//     })
//   })

//   app.get('/api/users/:_id/logs', (req, res) => {
//     let limit = req.query.limit
//     User.findById(req.params._id)
//     .then(result => {
//       let dateObj = {}

//       if(req.query.from) {
//         dateObj["$gte"] = new Date(req.query.from)
//       }

//       if(req.query.to) {
//         dateObj["$lte"] = new Date(req.query.to)
//       }

//       let filter = {
//         username: result.username
//       }

//       if(req.query.from || req.query.to) {
//         filter.date = dateObj
//       }
//       console.log(filter)

//       Exercise.find(filter).limit(+limit ?? 500)
//       .then(ex => {
//         const log = ex.map(e => ({
//           description: e.description,
//           duration: e.duration,
//           date: e.date.toDateString()
//         }))
//         console.log(ex)
//         res.json({
//           username: result.username,
//           count: ex.length,
//           _id: result._id,
//           log          

//         })
//       })
//     })
//   })

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})




// const Schema = mongoose.Schema;

// // User
// const userSchema = new Schema({
//   username: { type: String, required: true }
// })
// let userModel = mongoose.model("user", userSchema);

// // Exercise
// const exerciseSchema = new Schema({
//   userId: { type: String, required: true },
//   description: { type: String, required: true },
//   duration: { type: Number, required: true },
//   date: { type: Date, default: new Date() }
// })
// let exerciseModel = mongoose.model("exercise", exerciseSchema);


// app.use("/", bodyParser.urlencoded({ extended: false }));

// app.get('/', (req, res) => {
//   res.sendFile(__dirname + '/views/index.html')
// });

// app.post('/api/users', (req, res) => {
//   let username = req.body.username;
//   let newUser = new userModel({ username: username });
//   newUser.save();
//   res.json(newUser);
// })

// app.get('/api/users', (req, res) => {
//   userModel.find({}).then((users) => {
//     res.json(users);
//   })
// })

// app.post('/api/users/:_id/exercises', (req, res) => {
//   console.log(req.body);


//   let userId = req.params._id;
  
//   exerciseObj = {
//     userId: userId,
//     description: req.body.description,
//     duration: req.body.duration
//   }

//   // If there is a date add it to the object
//   if (req.body.date != ''){
//     exerciseObj.date = req.body.date
//   }

//   let newExercise = new exerciseModel(exerciseObj);

//   userModel.findById(userId)
//   .then(userFound => {

//     newExercise.save();
//     res.json({
//       _id: userFound._id, username: userFound.username,
//       description: newExercise.description, duration: parseInt(newExercise.duration),
//       date: new Date(newExercise.date).toDateString()
//     })
//   })
// })

// app.get('/api/users/:_id/logs', (req, res) => {

//   let fromParam = req.query.from;
//   let toParam = req.query.to;
//   let limitParam = req.query.limit;  
//   let userId = req.params._id;

//   // If limit param exists set it to an integer
//   limitParam = limitParam ? parseInt(limitParam): limitParam

//   userModel.findById(userId) 
//   .then(userFound => {
//     console.log(userFound);
    
//       let queryObj = {
//         userId: userId
//       };
//       // If we have a date add date params to the query
//       if (fromParam || toParam){
    
//           queryObj.date = {}
//           if (fromParam){
//             queryObj.date['$gte'] = fromParam;
//           }
//           if (toParam){
//             queryObj.date['$lte'] = toParam;
//           }
//         }

    
//     exerciseModel.find(queryObj).limit(limitParam)
//     .then(exercises => {
  
//       let resObj = 
//         {_id: userFound._id,
//          username: userFound.username
//         }
  
//       exercises = exercises.map((x) => {
//         return {
//           description: x.description,
//           duration: x.duration,
//           date: new Date(x.date).toDateString()
//         }
//       })
//       resObj.log = exercises;
//       resObj.count = exercises.length;
      
//       res.json(resObj);
//     })
    
//   })
// })
