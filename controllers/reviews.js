import Campground from "../models/campground.js";
import Review from "../models/review.js";

export const createReview = async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.creator = req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash("success", "Your review has been submitted!");
    res.redirect(`/campgrounds/${campground._id}`);
}

export const deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "You review has been deleted!");
    res.redirect(`/campgrounds/${id}`);
}