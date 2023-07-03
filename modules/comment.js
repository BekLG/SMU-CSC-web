const mongoose = require('mongoose');

const commentSchema= new mongoose.Schema({
    name: String,
    email: String,
    comment: String
});

const comment = new mongoose.model("comment", commentSchema);

module.exports = comment;