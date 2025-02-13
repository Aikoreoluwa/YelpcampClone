const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
require('dotenv').config();
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
const Campground = require("./models/campground");
const campground = require("./models/campground");
const atlasUrl = process.env.DATABASE_URL;
const localUrl = "mongodb://127.0.0.1:27017/Yelpcamp"
const unsplashApi = process.env.Unsplash_API


// const connectToDatabase = async () => {
//     try {
//         // Attempt to connect to the Atlas server
//         await mongoose.connect(atlasUrl);
//         console.log('Connected to Atlas server');
//     } catch (atlasError) {
//         console.error('Failed to connect to Atlas server:', atlasError);

//         // If Atlas connection fails, attempt to connect to the local server
//         try {
//             await mongoose.connect(localUrl);
//             console.log('Connected to local server');
//         } catch (localError) {
//             console.error('Failed to connect to local server:', localError);
//             process.exit(1); // Exit the process if both connections fail
//         }
//     }
// };

// // Call the function to connect to the database
// connectToDatabase();

const connectToDatabase = async () => {
    console.log("NODE_ENV:", process.env.NODE_ENV); // This will print the value of NODE_ENV in the console

    let dbUrl = process.env.NODE_ENV === "production" ? atlasUrl : localUrl;

    console.log("Trying to connect to database with URL:", dbUrl); // Debugging line

    try {
        await mongoose.connect(dbUrl);
        console.log(`✅ Connected to ${dbUrl.includes("mongodb.net") ? "Atlas" : "Local"} server`);
    } catch (error) {
        console.error(`❌ Failed to connect to ${dbUrl.includes("mongodb.net") ? "Atlas" : "Local"} server:`, error);

        if (dbUrl === atlasUrl) {
            console.log("🔄 Retrying with local database...");
            try {
                await mongoose.connect(localUrl);
                console.log("✅ Connected to Local server");
            } catch (localError) {
                console.error("❌ Failed to connect to Local database:", localError);
                process.exit(1);
            }
        } else {
            process.exit(1);
        }
    }
};

// Call the function to connect to the database
connectToDatabase();



// const connectToDatabase = async () => {
//     console.log("DATABASE_URL:", process.env.DATABASE_URL);
//     const atlasUrl = process.env.DATABASE_URL; // MongoDB Atlas connection string
//     const localUrl = "mongodb://127.0.0.1:27017/yelpcamp"; // Local MongoDB connection string

//     // Check if DATABASE_URL is missing or invalid
//     if (!atlasUrl || !atlasUrl.startsWith("mongodb")) {
//         console.error("Invalid or missing DATABASE_URL. Please check your environment variables.");
//         process.exit(1);
//     }

//     try {
//         await mongoose.connect(atlasUrl);
//         console.log("Connected to MongoDB Atlas");
//     } catch (atlasError) {
//         console.error("Failed to connect to MongoDB Atlas:", atlasError);

//         // If running locally, fall back to local MongoDB
//         if (process.env.NODE_ENV === "development") {
//             try {
//                 await mongoose.connect(localUrl);
//                 console.log("Connected to local MongoDB");
//             } catch (localError) {
//                 console.error("Failed to connect to local MongoDB:", localError);
//                 process.exit(1);
//             }
//         } else {
//             console.error("Cannot connect to MongoDB Atlas in production. Exiting...");
//             process.exit(1);
//         }
//     }
// };

// connectToDatabase();

const app = express();

app.engine("ejs", ejsMate)

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

app.get("/", (req, res) => {
    res.render("home")
})

app.get("/campgrounds", async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds })
})

app.get("/campgrounds/new", (req, res) => {
    res.render("campgrounds/new");
})
app.post("/campgrounds", async (req, res) => {
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`)
})

app.get("/campgrounds/:id", async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render("campgrounds/info", { campground })
})

app.get("/campgrounds/:id/edit", async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render("campgrounds/edit", { campground })
})

app.put("/campgrounds/:id", async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground })
    res.redirect(`/campgrounds/${campground._id}`)
})

app.delete("/campgrounds/:id", async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect("/campgrounds");
})

const PORT = process.env.PORT || 3000;

console.log(`Using PORT: ${PORT}`);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
// const port = process.env.PORT || 3000;
// // Use Render's PORT or fallback to 3000 for local development
// app.listen(port, () => {
//     console.log(`Listening on port ${port}`);
// });