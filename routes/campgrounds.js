const express = require("express");
const router = express.Router();
const catchAsync = require("../utilities/catchAsync");
const { isLoggedIn, validateCampground, isCreator } = require("../middleware");
const Campground = require("../models/campground");
const campgrounds = require("../controllers/campgrounds");
const multer = require("multer");
const { storage } = require("../cloudinary");
const campground = require("../models/campground");
const upload = multer({ storage });

router.route("/")
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn, upload.array("image"), validateCampground, catchAsync(campgrounds.createCampground));

router.get("/new", isLoggedIn, campgrounds.renderNewCampgroundForm);

router.route("/:id")
    .get(catchAsync(campgrounds.campgroundInfo))
    .put(isLoggedIn, isCreator, upload.array("image"), validateCampground, catchAsync(campgrounds.updateCampground))
    .delete(isLoggedIn, isCreator, catchAsync(campgrounds.deleteCampground));

router.get("/:id/edit", isLoggedIn, isCreator, catchAsync(campgrounds.renderCampgroundEditForm));

module.exports = router;