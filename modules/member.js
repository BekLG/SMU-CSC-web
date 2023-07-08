const mongoose = require('mongoose');

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
    attendances:[Object],      // collections of memebers attendance
    joinedDate: Date
});
const Member = new mongoose.model("member", memberSchema);

module.exports = Member;