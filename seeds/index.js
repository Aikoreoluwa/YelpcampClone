require('dotenv').config();
const mongoose = require("mongoose");
const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");
const Campground = require("../models/campground");

mongoose.connect(process.env.DATABASE_URL)
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected!");
});

const sample = array => array[Math.floor(Math.random() * array.length)];
const seedDB = async () => {
    await Campground.deleteMany();
    for (let i = 0; i < 350; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            creator: new mongoose.Types.ObjectId('67d41cfb6ae51343627c2297'),
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            images: [
                {
                    url: 'https://res.cloudinary.com/dq8yorgha/image/upload/v1742918943/Yelpcamp/rsclw9qsf14ftsff1tbl.jpg',
                    filename: 'Yelpcamp/rsclw9qsf14ftsff1tbl'
                }
            ],
            description: " Lorem ipsum dolor sit amet consectetur adipisicing eli Perspiciatis",
            price,
            geometry: {
                type: "Point",
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude
                ]
            },
        })
        await camp.save();
    }
}
seedDB().then(() => {
    mongoose.connection.close();
});