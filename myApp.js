
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
    log: [{type: Schema.Types.ObjectId, ref: 'Exercise'}],
    count: {type: Number, default:0},
});

//set up exercise schema 
const exerciseSchema = new Schema({
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
const createAndSaveExercise = async (userId, exercise) => {
    var user = await User.findById(userId);
    if(!user){
        //error
        console.log("couldnt find user");
        return
    }

    var newExercise = await Exercise.create(exercise);
    if(!newExercise){
        console.log("couldnt create exercise");
        return
    }

    var updatedUser = await User
    .findByIdAndUpdate(userId, {$push: {exercise: newExercise._id}, $inc : {"count": 1}}, {new:true, useFindAndModify: false})
    .populate("exercise");
    if(!updatedUser){
        console.log("couldnt add exercise to user");
        return
    }

    var objectToReturn = {
        _id:user._id,
        username: user.username,
        date: newExercise.date,
        duration: newExercise.duration,
        description: newExercise.description
    }

    return objectToReturn;
    
}

//retrieve functions
const getAllUsers = (done) => {
    User.find((err, users)=>{
        if(err) return console.log(err);
        done(null, users, "found users");
    });
}

const getLog = async (userId, params) => {
    
    
    /////////working here
    var user = await User.findById(userId).populate("log");
    var log = user.log;

    var filteredLog = [];
    //get logs between from and to
    if(params.from){
        for (var foundLog of log ){
            console.log(foundLog);
             if((foundLog.date >= params.from) && (foundLog.date <= params.to)){
                filteredLog.push(foundLog); 
            }
         }    
    }else{
        for (var foundLog of log ){
            console.log(foundLog);
            if(foundLog.date <= params.to){
                filteredLog.push(foundLog); 
            }
         }    
    }
    //sort by date
    filteredLog = filteredLog.sort((a,b)=>a.date.getTime()-b.date.getTime());

    if(params.limit){
        filteredLog = filteredLog.slice(0,params.limit);
    }

    var objectToReturn = {
        _id : user._id,
        username : user.username,
        log: filteredLog,
        count: user.count
    }
    return objectToReturn;
}

const updateCount = async () => {
    var users = [];
    for await (var user of User.find()){
        user.count = user.log.length;
        await user.save();
        users.push(user); 
    }
    return(users);
}



module.exports = {
    createAndSaveUser : createAndSaveUser,
    createAndSaveExercise : createAndSaveExercise,
    getAllUsers: getAllUsers,
    getLog: getLog,
    updateCount: updateCount,
}
















