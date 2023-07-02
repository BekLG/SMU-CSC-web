const mongoose = require('mongoose');

const commentSchema= new mongoose.Schema({
    name: String,
    email: String,
    commnet: String
});

const Commnet = new mongoose.model("comment", commentSchema);

module.exports = Commnet;