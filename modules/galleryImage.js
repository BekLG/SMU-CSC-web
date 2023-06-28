const mongoose = require('mongoose');

const galleryImageSchema = new mongoose.Schema({
    caption: String,
    imageURL: String
});


const GalleryImage= new mongoose.model("galleryImage", galleryImageSchema);

module.exports= GalleryImage;