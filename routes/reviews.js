import express from "express";
const router = express.Router({ mergeParams: true });

import catchAsync from "../utilities/catchAsync.js";
import ExpressError from "../utilities/ExpressError.js";

import Campground from "../models/campground.js";
import Review from "../models/review.js";
import * as reviews from "../controllers/reviews.js";
import { validateReview, isLoggedIn, isReviewCreator } from "../middleware.js";

router.post("/", isLoggedIn, validateReview, catchAsync(reviews.createReview));
router.delete("/:reviewId", isLoggedIn, isReviewCreator, catchAsync(reviews.deleteReview));

export default router;