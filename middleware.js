import ExpressError from "./utilities/ExpressError.js";
import { serverSchema, reviewSchema } from "./errHandlerSchema.js";
import Campground from "./models/campground.js";
import Review from "./models/review.js";

export const isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash("error", "Sorry, you need to be logged in!");
        return res.redirect("/login");
    }
    next();
};

export const validateCampground = (req, res, next) => {
    const { error } = serverSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(",");
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
};

export const isCreator = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground.creator.equals(req.user._id)) {
        req.flash("error", "You are not authorized!");
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
};

export const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(",");
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
};

export const isReviewCreator = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review.creator.equals(req.user._id)) {
        req.flash("error", "You are not authorized!");
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
};