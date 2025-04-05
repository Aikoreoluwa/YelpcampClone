const express = require("express");
const router = express.Router({ mergeParams: true });

const catchAsync = require("../utilities/catchAsync");
const ExpressError = require("../utilities/ExpressError");

const Campground = require("../models/campground");
const Review = require("../models/review");
const reviews = require("../controllers/reviews");
const { validateReview, isLoggedIn, isReviewCreator } = require("../middleware");

router.post("/", isLoggedIn, validateReview, catchAsync(reviews.createReview));
router.delete("/:reviewId", isLoggedIn, isReviewCreator, catchAsync(reviews.deleteReview));
module.exports = router;