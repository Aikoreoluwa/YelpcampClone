import dotenv from "dotenv";
dotenv.config();
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import ExpressError from "./utilities/ExpressError.js";
import express from "express";
import path from "path";
import mongoose from "mongoose";
import ejsMate from "ejs-mate";
import session from "express-session";
import flash from "connect-flash";
import methodOverride from "method-override";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import User from "./models/user.js";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import MongoStore from "connect-mongo";

import userRoutes from "./routes/users.js";
import campgroundsRoutes from "./routes/campgrounds.js";
import reviewsRoutes from "./routes/reviews.js";

const atlasUrl = process.env.DATABASE_URL;
const localUrl = "mongodb://127.0.0.1:27017/Yelpcamp"
const unsplashApi = process.env.Unsplash_API;

mongoose.connect(process.env.DATABASE_URL)
console.log("✅ Connected to MongoDB Atlas");

const app = express();

app.engine("ejs", ejsMate)
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.use(mongoSanitize({
    replaceWith: '_',
}));

const secret = process.env.SECRET || "thisisnotabettersecret";

const sessionConfig = {
    name: "session",
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        secure: false,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
};
const configureSessionStore = () => {
    // PRODUCTION-ONLY VERSION (comment out this block to use fallback logic)
    if (!mongoose.connection) throw new Error("MongoDB not connected");
    sessionConfig.store = MongoStore.create({
        client: mongoose.connection.getClient(),
        touchAfter: 24 * 60 * 60
    });
    console.log("🚀 Using MongoDBStore (production)");

    sessionConfig.store.on("error", (e) => {
        console.error("‼️ Session store error:", e);
    });
};
app.use(session(sessionConfig));
app.use(flash());

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net/",
]

const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://cdn.jsdelivr.net/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/"
]

const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.tiles.mapbox.com/",
    "https://events.mapbox.com",
]

const fontSrcUrls = [];

const imgSrcUrls = [
    "https://res.cloudinary.com/dq8yorgha/",
    "https://images.unsplash.com/",
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
];

app.use(helmet.contentSecurityPolicy({
    directives: {
        defaultSrc: [],
        connectSrc: ["'self'", ...connectSrcUrls],
        scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
        styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
        workerSrc: ["'self'", "blob:"],
        objectSrc: [],
        imgSrc: ["'self'", "data:", "blob:", ...imgSrcUrls],
        fontSrc: ["'self'", ...fontSrcUrls],
    },
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.activeUser = req.user;
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
})

app.use("/", userRoutes);
app.use("/campgrounds", campgroundsRoutes);
app.use("/campgrounds/:id/reviews", reviewsRoutes);

app.get("/", (req, res) => {
    res.render("home")
});

app.all("*", (req, res, next) => {
    next(new ExpressError("Page not found", 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = "Something went wrong!"
    res.status(statusCode).render("error", { err });
})

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})