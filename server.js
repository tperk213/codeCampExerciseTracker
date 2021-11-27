const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

let mongoose;
try{
  mongoose = require("mongoose");
} catch(e){
  console.log("error getting mongoose: " + e);
}

// import model from myApp.js here
app.use(cors())
app.use(express.static('public'))

//body parser code here
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

//import myApp database funcitons here
const dbhandler = require("./myApp");

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post('/api/users', (req, res) =>{
  dbhandler.createAndSaveUser({username: req.body.username}, (err, user, msg)=>{
    if(err) return console.log(err);
    console.log(msg);
    res.json(user);
  });
});

app.get('/api/users', (req, res)=>{
  dbhandler.getAllUsers((err, users, msg)=>{
    console.log(msg);
    res.json(users);
  });
});

//You can POST to /api/users/:_id/exercises with form data description, duration, and optionally date. If no date is supplied, the current date will be used.
app.post('/api/users/:_id/exercises', (req, res, next)=>{
  //validation of body params goes here
  //validation pattern
  // var notFound = []
  // if(req.body.username === ""){
  //   notFound.push("`userName`");
  // }
  // if(notFound.length > 0) return res.send(notFound.toString() + "required");
  // else next();
  next();
},
(req,res) => {
  var exerciseData = {
    description : req.body.description,
    duration : req.body.duration,
    date : req.body.date ? new Date(req.body.date) : new Date(Date.now())
  }
  var promise = dbhandler.createAndSaveExercise(req.params._id, exerciseData);
  promise.then((updatedUser)=>{
    if(!updatedUser){
      res.send("failure");
      return
    }
  
    res.json(updatedUser);
  })
  
  // promise
  //   .then((data) =>{
  //     return res.json(data);
  //   })
  //   .catch((reason)=>{
  //       return res.send(reason);
  //   });
});


//get logs
app.get('/api/users/:_id/logs', (req, res)=>{
  //validation to make sure dates are actually dates
  
  
  var userId = req.params._id;
  var params = {
    from : req.query.from ? new Date(req.query.from) : null,
    to : req.query.to ? new Date(req.query.to) : Date.now(),
    limit : req.query.limit ? req.query.limit : null,
  } 
  
  dbhandler.getLog(userId, params)
  .then((user)=>{
    if(!user){
      res.send("error finding person");
    }
    res.json(user);
  });
});

app.get('/api/users/update', (req, res)=>{
  dbhandler.updateCount().
  then((response)=>{
    res.send(response);
  })
});

app.get('/api/users/:id/test', (req,res)=>{
  if(req.query.from){
    res.send(`from is ${req.query.from}`)
  }
  res.send("working");
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
