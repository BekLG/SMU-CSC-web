const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    email: { type: String, unique: true },
    password: String
  });

const Admin= new mongoose.model("Admins", adminSchema);

module.exports = Admin;