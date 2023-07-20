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
const cloudinary = require('./modules/cloudinary');



const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('public', path.join(__dirname, 'public'));
app.set('modules', path.join(__dirname, 'modules'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(session({
    secret: "our little secret to be replaced by dotenv.",
    resave: false,
    saveUninitialized: false
}));

// mongoose.connect("mongodb://localhost/CSC-web", { useNewUrlParser: true });
const dbUsername = process.env.DB_USERNAME;
const dbPassword = process.env.DB_PASSWORD;
mongoose.connect("mongodb+srv://" + dbUsername + ":" + dbPassword + "@clustersmu-csc.cgwzcdi.mongodb.net/SMU-CSC", { useNewUrlParser: true });



app.get("/", function (req, res) {
    // home page will be displayed
    GalleryImage.aggregate([{ $sample: { size: 5 } }])  //pick 5 images randomly from gallery.
    .then((foundImage) => {
         res.render("index", { Images: foundImage });
    })
    .catch((err) => {
        console.log(err);
    })

})

app.get("/termsAndConditions", function (req, res) {
    // terms and conditions page will be displayed.
    res.render("termsAndConditions");
})

app.get("/newMembership", function (req, res) {
    // new membership registration page will be displayed.
    res.render("registration");
})

app.post("/newMembership", function (req, res) {
    const currentDate = new Date();

    const member = new Member({

        firstName: req.body.firstName,
        lastName: req.body.lastName,
        schoolId: req.body.schoolId,
        section: req.body.section,
        gender: req.body.gender,
        email: req.body.email,
        phoneNumber: req.body.phoneNumber,
        interests: req.body.interests,
        skillLevel: req.body.skillLevel,
        joinedDate: currentDate
    })

    member.save();
    res.redirect("/");

})

app.get("/news", function (req, res) {
    // news page will be displayed.

    News.find({}).sort({ _id: -1 })
        .then((foundNews) => {
             res.render("news", { News: foundNews, });

        })
        .catch((err) => {
            console.log(err);
        })
})


app.get("/events", function (req, res) {
    // events page will be displayed.
    //on the front-end if registrationRequired is false the registrationLink button will not be rendered

    Event.find({}).sort({ _id: -1 })
        .then((foundEvent) => {
             res.render("events", { Events: foundEvent, });
            
        })
        .catch((err) => {
            console.log(err);
        })
})

app.get("/gallery", function (req, res) {
    // gallery page will be displayed.

    GalleryImage.find({}).sort({ _id: -1 })
        .then((foundImage) => {
            res.render("gallery", { Images: foundImage, });
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
    res.render("adminlogin")
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

    
    if(req.session.isLoggedIn === true)
    {
        Event.find({}).limit(3).sort({ _id: -1 })
        .then((foundEvent) => {

            News.find({}).limit(3).sort({ _id: -1 })
            .then((foundNews) => {
                res.render("admin", { News: foundNews, Event: foundEvent });
            })
            .catch((err) => {
                console.log(err);
            })
            

        })
        .catch((err) => {
            console.log(err);
        })

    }
    else{
        res.redirect("/login")
    }

   
})

app.get("/admin/events", function (req, res) {
    // events and new-event adding form will be displayed for admin.
    if(req.session.isLoggedIn === true)
    {
        res.render("addEvent")
    }
    else{
        res.redirect("/login")
    }

    
})

app.post("/admin/events", upload.single('image'), function (req, res) {
    // new-event will be saved on database .

    const dateAndTimeInput = req.body.dateAndTime;
    const registrationDeadlineInput = req.body.registrationDeadline;
    const dateAndTime = new Date(dateAndTimeInput);
    const registrationDeadline = new Date(registrationDeadlineInput);

    const registrationRequired = req.body.registrationRequired === "on";

    console.log(registrationRequired);

    cloudinary.uploader.upload(req.file.path, (error, result) => {
        const imageUrl = req.file.path;

    })

    if(registrationRequired=== true)
    {
        const event = new Event({

            title: req.body.title,
            dateAndTime: dateAndTime,
            venue: req.body.venue,
            description: req.body.description,
            registrationRequired: registrationRequired,
            registrationDeadline: registrationDeadline,
            registrationLink: req.body.registrationLink,
            imageURL: "uploads/images/" + req.file.filename
        })

        event.save();
    }

    else
    {
        const event = new Event({

            title: req.body.title,
            dateAndTime: dateAndTime,
            venue: req.body.venue,
            description: req.body.description,
            registrationRequired: registrationRequired,
            imageURL: "uploads/images/" + req.file.filename
        })

        event.save();
    }

    
    res.redirect("/admin");

    // on the front-end if registrationRequired is false the registrationLink input have to be disabled
})


app.get("/admin/news", function (req, res) {
    // news and new-news adding form will be displayed for admin.
    if(req.session.isLoggedIn === true)
    {
        res.render("addNews")
    }
    else{
        res.redirect("/login")
    }
    
})

app.post("/admin/news", upload.single('image'), function (req, res) {
    // new-news will be saved on database .
    cloudinary.uploader.upload(req.file.path, (error, result) => {
        const imageUrl = req.file.path;

        const currentDate = new Date();

        const news = new News({
            title: req.body.title,
            date: currentDate,
            content: req.body.content,
            imageURL: imageUrl
        })

        news.save();
    })

    
    res.redirect("/admin");
})

app.get("/admin/gallery", function (req, res) {
    // image adding form will be displayed for admin.
    if(req.session.isLoggedIn === true)
    {
        res.render("addPhoto")
    }
    else{
        res.redirect("/login")
    }
    
})

app.post("/admin/gallery", upload.single('image'), function (req, res) {
    // new photos-path and caption will be saved on database.


    cloudinary.uploader.upload(req.file.path, (error, result) => {
        // if (error) {
        //   console.error('Error uploading to Cloudinary:', error);
        //   res.status(500).json({ error: 'Failed to upload image to Cloudinary' });
        // } else {
        //   // The public URL of the uploaded image on Cloudinary
        //   const imageUrl = result.secure_url;
        //   res.json({ imageUrl });
        // }
        const imageUrl = req.file.path;

        const galleryImage = new GalleryImage({
            caption: req.body.caption,
            imageURL: imageUrl
        })
    
        galleryImage.save();

      });

      
      



   
    res.redirect("/admin");
})

app.get("/admin/members", function (req, res) {
    //  members list will be rendered
    if(req.session.isLoggedIn === true)
    {
        Member.find({}).sort({ _id: -1 })
        .then((foundMember) => {
             res.render("members", { Member: foundMember, });
        })
        .catch((err) => {
            console.log(err);
        })
    }
    else{
        res.redirect("/login")
    }

    
})

app.get("/admin/members/:memberId", function (req, res) {
    //  members detail will be rendered
    if(req.session.isLoggedIn === true)
    {
        const memberId= req.params.memberId;

        Member.find({_id: memberId})
        .then((foundMember) => {
             res.render("memberDetails", { Member: foundMember });
        })
        .catch((err) => {
            console.log(err);
        })
    }
    else{
        res.redirect("/login")
    }


    
})

app.get("/admin/attendance", function (req, res) {
    // attendance taking page will be rendered
    if(req.session.isLoggedIn === true)
    {
        Member.find({})
        .then((foundMember) => {
            foundMember.sort((a, b) => a.firstName.localeCompare(b.firstName));
    
             res.render("attendance", { Member: foundMember, });
        })
        .catch((err) => {
            console.log(err);
        })
    }
    else{
        res.redirect("/login")
    }

})

app.post("/admin/attendance", function (req, res) {
    // new attendance will be saved on DB

    //creating attendance object
    if(req.session.isLoggedIn === true)
    {
        
    const attendance = {
        date: new Date(), // Current date and time
        title: req.body.title,
        attendanceType: req.body.attendanceType
      };
      
      const attendedMembers = req.body.attended;
     
    
      if(Array.isArray(attendedMembers)===true)
      {
        
      attendedMembers.forEach((attendedMember) => {

        var query = { _id: attendedMember };
        Member.findOneAndUpdate(query, {
          $push: { attendances: attendance }
        })
          .then(() => {
           
          })
          .catch((err) => {
            console.log(err);
          });
        
      });
      
        res.redirect("/admin");
      }
      else{
        //only one member is attended, so it can not be performed by forEach. we will handle it solely
        var query = { _id: attendedMembers };
        Member.findOneAndUpdate(query, {
          $push: { attendances: attendance }
        })
          .then(() => {
            res.redirect("/admin");
          })
          .catch((err) => {
            console.log(err);
          });        
      }
    
    }
    else{
        res.redirect("/login")
    }
         
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