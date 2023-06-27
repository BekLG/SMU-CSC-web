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

mongoose.connect("mongodb://localhost/CSC-web", { useNewUrlParser: true });

const memberSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    schoolId: String,   // ye temariw ID
    section: String,
    gender: String,
    email: String,
    phoneNumber: String,
    interests: [String],        //topics that the member is interested on e.g., programming, artificial intelligence, cybersecurity, data science, web development, etc.
    skillLevel: String          // members skill level on selected interests
});
const Member = new mongoose.model("member", memberSchema);

app.get("/", function(req,res){
    res.send("home page");
})






app.listen(3000, function(req,res){
    console.log("listening on port 3000");
})