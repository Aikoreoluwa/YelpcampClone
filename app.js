const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const Campground = require("./models/campground");

mongoose.connect("mongodb://127.0.0.1:27017/Yelpcamp")
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected!");
});

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"))

app.get("/", (req, res) => {
    res.render("home")
})

// app.get("/makecampground", async (req, res) => {
//     try {
//         const camp = new Campground({ title: "My Backyard", description: "cheap camping" });
//         await camp.save();
//         res.send(camp);
//     } catch (error) {
//         console.error(error);
//         res.status(500).send({ message: "Error saving document" });
//     }
// });

app.get("/makecampground", async (req, res) => {
    const beachCamp = new Campground({
        title: "Ocean Breeze", description:
            "Relaxing beach camp with stunning ocean views", location:
            "Miami Beach, FL", price: "$15/Night"
    });
    await beachCamp.save();
    res.send(beachCamp);
})

app.listen(3000, () => {
    console.log("listening on port 3000!")
})