
var mongoose = require("mongoose");
var ObjectId = require("mongodb").ObjectId;
const Schema = mongoose.Schema;

mongoose.connect(
    process.env['MONGO_URI'],
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }
);

//setup user schema
const userSchema = new Schema({
    username: {type: String, required: true,  unique:true, dropDups:true},
    exercise: {type: Array, default: []}
});

//set up exercise schema 
const exerciseSchema = new Schema({
    username:{type: String, required:true},
    description: String,
    duration: Number,
    date: {type: Date, },
});

let User = mongoose.model("User", userSchema);
let Exercise = mongoose.model("Exercise", exerciseSchema);

//create functions
const createAndSaveUser = (userData, done) =>{
    
    //find a user and if there isnt one create them and return user
    User.findOne(userData).
    exec((err, user)=>{
        if(err) return console.log(err);
        if(!user){
            User.create(userData, (err, newUser)=>{
                if(err) return console.log(err);
                done(null, newUser, "new user created");
            });   
        }else{
            done(null, user, "found user");
        }
        
    });     
}

const updateUserExercise = (exerciseData, done) => {
    User.findOneAndUpdate({username: exerciseData.username},{$push: {exercise: exerciseData.id}},{new:true},(err,userFound)=>{
        if(err) return console.log(err);
    });
    //find user and populate with exercises
    User.find({username:exerciseData.username}).populate("exercise").exec((err, user)=>{
        if(err) return console.log(err);
        done(null, user);
    });
}
const createAndSaveExercise = (exerciseData, done) => {
    var username;
    var o_id = new ObjectId(exerciseData.id);
    User.find({_id:o_id}).exec((err, user)=>{
        username = user.username;
        console.log("user name for id:"+exerciseData.id);
        console.log("is :"+username);
        
    });
    var currentExercise = new Exercise({
        username: username,
        description: exerciseData.description,
        duration: exerciseData.duration,
        date: exerciseData.date,
    })

    currentExercise.save((err, res) =>{
        if(err) return console.log(err);
        done(null, res);
    });
}

//retrieve functions
const getAllUsers = (done) => {
    User.find((err, users)=>{
        if(err) return console.log(err);
        done(null, users, "found users");
    });
}

module.exports = {
    createAndSaveUser : createAndSaveUser,
    createAndSaveExercise : createAndSaveExercise,
    getAllUsers: getAllUsers,
}
















