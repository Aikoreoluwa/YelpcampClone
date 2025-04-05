require("dotenv").config();
const ExpressError = require("./utilities/ExpressError");
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const methodOverride = require("method-override");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");
const helmet = require("helmet");
const mongoSanitize = require('express-mongo-sanitize');
const MongoStore = require("connect-mongo");

const userRoutes = require("./routes/users");
const campgroundsRoutes = require("./routes/campgrounds");
const reviewsRoutes = require("./routes/reviews");

const atlasUrl = process.env.DATABASE_URL;
const unsplashApi = process.env.Unsplash_API;

const startServer = async () => {
    try {
        // 1. Connect to MongoDB
        await mongoose.connect(atlasUrl, {
            serverSelectionTimeoutMS: 5000
        });
        console.log("✅ Connected to MongoDB Atlas");

        const app = express();

        // 2. Configure session store
        const secret = process.env.SECRET || "thisisnotabettersecret";
        const sessionConfig = {
            store: MongoStore.create({
                client: mongoose.connection.getClient(),
                touchAfter: 24 * 60 * 60
            }),
            name: "session",
            secret,
            resave: false,
            saveUninitialized: true,
            cookie: {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
                maxAge: 1000 * 60 * 60 * 24 * 7
            }
        };

        // 3. App configuration
        app.engine("ejs", ejsMate);
        app.set("view engine", "ejs");
        app.set("views", path.join(__dirname, "views"));

        app.use(express.urlencoded({ extended: true }));
        app.use(methodOverride("_method"));
        app.use(express.static(path.join(__dirname, "public")));
        app.use(mongoSanitize({ replaceWith: '_' }));
        app.use(session(sessionConfig));
        app.use(flash());

        // Security headers
        const scriptSrcUrls = [
            "https://stackpath.bootstrapcdn.com/",
            "https://api.mapbox.com/",
            "https://api.tiles.mapbox.com/",
            "https://kit.fontawesome.com/",
            "https://cdnjs.cloudflare.com/",
            "https://cdn.jsdelivr.net/",
        ];

        const styleSrcUrls = [
            "https://kit-free.fontawesome.com/",
            "https://stackpath.bootstrapcdn.com/",
            "https://cdn.jsdelivr.net/",
            "https://api.mapbox.com/",
            "https://api.tiles.mapbox.com/",
            "https://fonts.googleapis.com/",
            "https://use.fontawesome.com/"
        ];

        const connectSrcUrls = [
            "https://api.mapbox.com/",
            "https://a.tiles.mapbox.com/",
            "https://b.tiles.mapbox.com/",
            "https://events.tiles.mapbox.com/",
            "https://events.mapbox.com/",
        ];

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
                fontSrc: ["'self'"]
            }
        }));

        // Passport configuration
        app.use(passport.initialize());
        app.use(passport.session());
        passport.use(new LocalStrategy(User.authenticate()));
        passport.serializeUser(User.serializeUser());
        passport.deserializeUser(User.deserializeUser());

        // Flash messages
        app.use((req, res, next) => {
            res.locals.activeUser = req.user;
            res.locals.success = req.flash("success");
            res.locals.error = req.flash("error");
            next();
        });

        // Routes
        app.use("/", userRoutes);
        app.use("/campgrounds", campgroundsRoutes);
        app.use("/campgrounds/:id/reviews", reviewsRoutes);

        app.get("/", (req, res) => {
            res.render("home");
        });

        // Error handling
        app.all("*", (req, res, next) => {
            next(new ExpressError("Page not found", 404));
        });

        app.use((err, req, res, next) => {
            const { statusCode = 500 } = err;
            if (!err.message) err.message = "Something went wrong!";
            res.status(statusCode).render("error", { err });
        });

        // Start server
        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });

    } catch (error) {
        console.error("💥 CRITICAL STARTUP ERROR:", error);
        process.exit(1);
    }
};

// Start the application
startServer();