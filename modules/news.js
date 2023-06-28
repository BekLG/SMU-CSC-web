const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
    title: String,
    date: Date,
    content: String,
    coverURL: String
});

const News= new mongoose.model("news", newsSchema);

module.exports = News;