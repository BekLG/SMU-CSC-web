require("dotenv").config();
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const lodash = require("lodash");
const findOrCreate = require('mongoose-findorcreate');
const path = require("path");
const { log } = require("console");

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('public', path.join(__dirname, 'public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost/CSC", { useNewUrlParser: true });

const memberSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    schoolId: String,   // ye temariw ID
    section: String,
    gender: String,
    email: String,
    phoneNumber: String,
    interests: [String],        //topics that the member is interested on e.g., programming, artificial intelligence, cybersecurity, data science, web development, etc.
    skillLevel: String,        // members skill level on selected interests
    attendances:[Object]        // collections of memebers attendance
});
const Member = new mongoose.model("member", memberSchema);


const eventSchema= new mongoose.Schema({
    title: String,
    dateAndTime:Date,
    venue : String,
    description: String,
    registrationRequired: Boolean,
    registrationDeadline:Date,
    registrationLink: String
});

const Event = new mongoose.model("event", eventSchema);







app.get("/", function(req,res){
    res.send("home page");
})




app.post("/newMembership",function(req,res){

    const member = new Member({
        
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        schoolId : req.body.schoolId,
        section: req.body.section,
        gender: req.body.gender,
        email: req.body.email,
        phoneNumber: req.body.phoneNumber,
        interests: req.body.interests ,
        skillLevel: req.body.skillLevel
    })

    member.save();
    console.log("successfully saved");
    res.redirect("/");
    
})




app.listen(3000, function(req,res){
    console.log("listening on port 3000");
})