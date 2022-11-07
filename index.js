const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { UserModel } = require("./models/User.model");
const { connection } = require("./config/db");
const { authentication } = require("./middleware/authentication");
const { TaskModel } = require("./models/Task.model");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("HomePage")
})

app.post("/signup", async (req, res) => {
    const { email, password } = req.body;
    const Ipaddress = req.socket.remoteAddress
    console.log(Ipaddress)
    const isUser = await UserModel.findOne({ email })
    if (isUser) {
        res.send({ "msg": "User already exist, Try using different email" })
    } else {
        bcrypt.hash(password, 4, async (err, hash) => {
            if (err) {
                res.send({ "msg": "Something went wrong, Please try again later" })
            }
            const new_user = new UserModel({
                email,
                password: hash,
                ip: Ipaddress
            })
            try {
                await new_user.save()
                res.send({ "msg": "Sign up successful" })
            } catch (error) {
                res.send({ "msg": "Something went wrong, Please try again later" })
            }
        })
    }
})

app.post("/login", async (req, res) => {
    const {email,password} = req.body;
    const user = await UserModel.findOne({email})
    const hashed_password = user.password;
    const user_id = user._id;
    bcrypt.compare(password,hashed_password,(err,result)=>{
        if(err){
            res.send({"msg":"Something went wrong, Please try again"})
        }
        if(result){
            const token = jwt.sign({user_id},process.env.SECRET_KEY)
            res.send({"msg":"Login successful",token})
        }
    })
})

app.post("/todos/add", authentication, async (req,res)=>{
    const {taskname,status,tags,user_id} = req.body;
    const new_todo = new TaskModel({
        taskname,
        status,
        tags,
        user_id
    })
    await new_todo.save();
    res.send(new_todo)
} )

app.get("/todos",authentication,async(req,res)=>{
    const {user_id} = req.body;
    const userTasks = await TaskModel.find({user_id:user_id})
    res.send(userTasks)
})

app.listen(process.env.PORT, async (req, res) => {
    try {
        await connection;
        console.log({ "msg": "Connected to DB successfully" })
    } catch (err) {
        console.log({ "msg": "Connection to DB failed" })
        console.log(err)
    }
    console.log(`Listening on http://localhost:${process.env.PORT}`)
})