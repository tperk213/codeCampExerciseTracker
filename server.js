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

app.post('/api/users/:_id/exercises', (req, res)=>{

  var data = {

    description : req.body.description,
    duration : req.body.duration,
    id : req.params._id,
    date : req.body.date ? new Date(req.body.date) : new Date(Date.now())
  }
  console.log(data);
  //res.json(data);
  
  createAndSaveExercise(data, (user)=>{
    res.json({
      founduser:user
    });
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
