const ExpressError = require("./utilities/ExpressError");
const { serverSchema, reviewSchema } = require("./errHandlerSchema.js");
const Campground = require("./models/campground");
const Review = require("./models/review.js");

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl
        req.flash("error", "Sorry, you need to be logged in!")
        return res.redirect("/login")
    }
    next();
}

module.exports.validateCampground = (req, res, next) => {
    const { error } = serverSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(",");
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

module.exports.isCreator = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground.creator.equals(req.user._id)) {
        req.flash("error", "You are not authorized!")
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(",");
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

module.exports.isReviewCreator = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review.creator.equals(req.user._id)) {
        req.flash("error", "You are not authorized!")
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}