const mongoose = require("mongoose");
const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");
const Campground = require("../models/campground");
const fetch = require("node-fetch"); // Import fetch for API calls

mongoose.connect("mongodb://127.0.0.1:27017/Yelpcamp")
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected!");
});

const sample = array => array[Math.floor(Math.random() * array.length)];

// Fetch images from a specific Unsplash collection
const getImagesFromCollection = async () => {
    try {
        const response = await fetch("https://api.unsplash.com/collections/DSpWkevZa94/photos?client_id=2P15R73kJYeBzl81iQDYr4ZGbPgOXhZXVJJynpcW640&per_page=30");
        const data = await response.json();

        // Extract image URLs from the response
        return data.map(photo => photo.urls.regular);
    } catch (error) {
        console.error("Error fetching images from Unsplash:", error);
        return [];
    }
};

const seedDB = async () => {
    await Campground.deleteMany();
    const images = await getImagesFromCollection(); // Fetch images
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const imageUrl = images.length > 0 ? sample(images) : "https://via.placeholder.com/800x600"; // Pick a random image
        const camp = new Campground({
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            image: imageUrl,
            description: " Lorem ipsum dolor sit amet consectetur adipisicing eli Perspiciatis",
            price
        })
        await camp.save();
    }
}
seedDB().then(() => {
    mongoose.connection.close();
});