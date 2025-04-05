import express from "express";
import { Router } from "express";
import catchAsync from "../utilities/catchAsync.js";
import { isLoggedIn, validateCampground, isCreator } from "../middleware.js";
import Campground from "../models/campground.js";
import * as campgrounds from "../controllers/campgrounds.js";
import multer from "multer";
import { storage } from "../cloudinary/index.js"

const upload = multer({ storage });
const router = Router();

router.route("/")
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn, upload.array("image"), validateCampground, catchAsync(campgrounds.createCampground));

router.get("/new", isLoggedIn, campgrounds.renderNewCampgroundForm);

router.route("/:id")
    .get(catchAsync(campgrounds.campgroundInfo))
    .put(isLoggedIn, isCreator, upload.array("image"), validateCampground, catchAsync(campgrounds.updateCampground))
    .delete(isLoggedIn, isCreator, catchAsync(campgrounds.deleteCampground));

router.get("/:id/edit", isLoggedIn, isCreator, catchAsync(campgrounds.renderCampgroundEditForm));

export default router;