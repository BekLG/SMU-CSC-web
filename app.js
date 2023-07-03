require("dotenv").config();
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const lodash = require("lodash");
const findOrCreate = require('mongoose-findorcreate');
const path = require("path");
const session = require("express-session");
const bcrypt = require("bcrypt");
const { log } = require("console");


const Member = require("./modules/member")
const Event = require("./modules/event")
const News = require("./modules/news")
const GalleryImage = require("./modules/galleryImage")
const upload = require('./modules/multerMiddleware')
const Admin = require('./modules/admin')
const Comment = require('./modules/comment')


const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('public', path.join(__dirname, 'public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(session({
    secret: "our little secret to be replaced by dotenv.",
    resave: false,
    saveUninitialized: false
}));

mongoose.connect("mongodb://localhost/CSC-web", { useNewUrlParser: true });


app.get("/", function (req, res) {
    // home page will be displayed
    res.send("home page");
})

app.get("/newMembership", function (req, res) {
    // new membership registration page will be displayed.
})

app.post("/newMembership", function (req, res) {

    const member = new Member({

        firstName: req.body.firstName,
        lastName: req.body.lastName,
        schoolId: req.body.schoolId,
        section: req.body.section,
        gender: req.body.gender,
        email: req.body.email,
        phoneNumber: req.body.phoneNumber,
        interests: req.body.interests,
        skillLevel: req.body.skillLevel
    })

    member.save();
    res.redirect("/");

})

app.get("/news", function (req, res) {
    // news page will be displayed.

    News.find({})
        .then((foundNews) => {
            // res.render("news", { News: foundNews, });
            res.send(foundNews);

        })
        .catch((err) => {
            console.log(err);
        })
})


app.get("/events", function (req, res) {
    // events page will be displayed.
    //on the front-end if registrationRequired is false the registrationLink button will not be rendered

    Event.find({})
        .then((foundEvent) => {
            // res.render("events", { Event: foundEvent, });
            res.send(foundEvent);

        })
        .catch((err) => {
            console.log(err);
        })
})

app.get("/gallery", function (req, res) {
    // gallery page will be displayed.

    GalleryImage.find({})
        .then((foundImage) => {
            // res.render("gallery", { Image: foundImage, });
            res.send(foundImage);

        })
        .catch((err) => {
            console.log(err);
        })
})

app.post("/comment", function(req,res){
    //a comment from user will be saved on db
    const commnet = new Comment({

        name: req.body.name,
        email: req.body.email,
        comment: req.body.comment
   
    })

    commnet.save();
    res.redirect("/");
})

app.get("/login", function (req, res) {
    // login page will be displayed
})

app.post("/login", function (req, res) {
    // admin will be authenticated.

    const email = req.body.email;
    const password = req.body.password;

    Admin.find({ email: email })
        .then((foundAdmin) => {
            if (foundAdmin.length === 0) {
                console.log("no admins found!");
                res.redirect('/login');
            } else {
                const storedHashedPassword = foundAdmin[0].password;
                bcrypt.compare(password, storedHashedPassword, (err, result) => {
                    if (err || !result) {
                        // Invalid login credentials, redirect to login page
                        console.log("password didnt match");
                        res.redirect('/login');
                    } else {
                        // Valid login credentials, set session variable to indicate that the user is logged in
                        req.session.isLoggedIn = true;
                        req.session.role = 'admin';
                        // Redirect to dashboard
                        res.redirect('/admin');
                    }
                });
            }
        })
        .catch((err) => {
            console.log(err);
        });

})


app.get("/admin", function (req, res) {
    // admin will be authenticated and admins page will be displayed.
    res.send("admin page");
})

app.get("/admin/events", function (req, res) {
    // events and new-event adding form will be displayed for admin.
})

app.post("/admin/events", function (req, res) {
    // new-event will be saved on database .

    const dateAndTimeInput = req.body.dateAndTime;
    const registrationDeadlineInput = req.body.registrationDeadline;
    const dateAndTime = new Date(dateAndTimeInput);
    const registrationDeadline = new Date(registrationDeadlineInput);

    const event = new Event({

        title: req.body.title,
        dateAndTime: dateAndTime,
        venue: req.body.venue,
        description: req.body.description,
        registrationRequired: req.body.registrationRequired,
        registrationDeadline: registrationDeadline,
        registrationLink: req.body.registrationLink
    })

    event.save();
    res.redirect("/");

    // on the front-end if registrationRequired is false the registrationLink input have to be disabled
})


app.get("/admin/news", function (req, res) {
    // news and new-news adding form will be displayed for admin.
})

app.post("/admin/news", upload.single('imageURL'), function (req, res) {
    // new-news will be saved on database .

    const currentDate = new Date();

    const news = new News({
        title: req.body.title,
        date: currentDate,
        content: req.body.content,
        imageURL: "uploads/images/" + req.file.filename
    })

    news.save();
    res.redirect("/");
})

app.post("/admin/gallery", upload.single('imageURL'), function (req, res) {
    // new photos-path and caption will be saved on database.
    const galleryImage = new GalleryImage({
        caption: req.body.caption,
        imageURL: "uploads/images/" + req.file.filename
    })

    galleryImage.save();
    res.redirect("/");
})


app.get("/admin/attendance", function (req, res) {
    // attendance taking page will be rendered
})

app.post("/admin/attendance", function (req, res) {
    // new attendance will be saved on DB

    //creating attendance object
    const attendance = {
        date: new Date(), // Current date and time
        title: req.body.title,
        attendanceType: req.body.attendanceType
      };
      
      //var attendedMembers[]= req.body.attended;
      var attendedMembers=["649bfc96cf1849039dab4a09", "649bfcf5c1361eb52f24cb70"];


      attendedMembers.forEach(function(attendedMember){

        var query = { _id: attendedMember };
        Member.findOneAndUpdate(query, {
          $push: { attendances: attendance }
        })
          .then(() => {
           // res.redirect("/");
           console.log(attendedMember);
          })
          .catch((err) => {
            console.log(err);
          });

      })
      
        res.redirect("/admin");   
})




app.listen(3000, function (req, res) {
    console.log("listening on port 3000");


    Admin.find({ email: process.env.EMAIL_1 })
        .then((foundAdmin) => {
            if (foundAdmin.length === 0) {
                console.log("admin not found!");
                const password = bcrypt.hashSync(process.env.PASSWORD_1, 10);
                const admin = new Admin({
                    email: process.env.EMAIL_1,
                    password: password,
                })
                admin.save();

            }
            else {
                console.log("admin found!");
            }
        })
        .catch((err) => {
            console.log(err);
        })
})