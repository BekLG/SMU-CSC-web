const mongoose = require('mongoose');

const eventSchema= new mongoose.Schema({
    title: String,
    dateAndTime:Date,
    venue : String,
    description: String,
    registrationRequired: Boolean,  //is registration required or not?? if not required registrationLink will be empty.
    registrationDeadline:Date,
    registrationLink: String
});

const Event = new mongoose.model("event", eventSchema);

module.exports = Event;