const multer = require('multer');

// // Define the storage configuration for multer
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     // Specify the destination folder where the images will be stored
//     cb(null, 'public/uploads/images');
//   },
//   filename: function (req, file, cb) {
//     // Generate a unique filename for each uploaded image
//     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//     const extension = file.originalname.split('.').pop();
//     cb(null, file.fieldname + '-' + uniqueSuffix + '.' + extension);
//   },
// });

// // Create the multer middleware instance
// const upload = multer({ storage: storage });


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads'); // Destination folder for uploaded images on the server
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

module.exports = upload;
