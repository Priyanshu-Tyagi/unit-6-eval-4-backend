const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
    taskname:{type:String,required:true},
    status:{type:String,required:true},
    tags:{type:String,required:true},
    user_id:{type:String,required:true}
})

const TaskModel = mongoose.model("task",taskSchema)

module.exports = {TaskModel}