//This is a function call that imports the Mongoose library. 
const mongoose = require("mongoose");

//This accesses the Schema property from the mongoose object, 
//which was imported earlier.
const Schema = mongoose.Schema;

//By defining these fields as strings, you're telling 
//Mongoose that these fields should contain text data.
const CampgroundSchema = new Schema({
    title: String,
    price: Number,
    description: String,
    location: String,
    image: String
})

//This creates a new Mongoose model named "campground" 
//based on the campgroundSchema defined earlier.
module.exports = mongoose.model("Campground", CampgroundSchema);