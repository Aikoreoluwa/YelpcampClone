import dotenv from 'dotenv';
dotenv.config();
import Campground from "../models/campground.js";
import { createClient, geocodingService } from '../mapboxWrapper.js';
import { cloudinary } from "../cloudinary/index.js";

const mapBoxToken = process.env.MAPBOX_TOKEN;
// const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const mapboxClient = createClient({ accessToken: mapBoxToken });
const geocoder = geocodingService(mapboxClient);

export const index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds });
};

export const renderNewCampgroundForm = (req, res) => {
    res.render("campgrounds/new");
};

export const createCampground = async (req, res) => {
    const geoData = await geoCoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send();

    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.body.features[0].geometry;
    campground.images = req.files.map(f => ({
        url: f.path,
        filename: f.filename
    }));
    campground.creator = req.user._id;
    await campground.save();

    req.flash("success", "You've successfully made a new campground!");
    res.redirect(`/campgrounds/${campground._id}`);
};

export const campgroundInfo = async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate({
        path: "reviews",
        populate: {
            path: "creator"
        }
    }).populate("creator");

    console.log("Campground:", campground);
    console.log("Campground Creator:", campground.creator);

    if (!campground) {
        console.log("Error fetching campground:", err);
        req.flash("error", "No campground found!");
        return res.redirect("/campgrounds");
    }

    res.render("campgrounds/info", { campground });
};

export const renderCampgroundEditForm = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);

    if (!campground) {
        req.flash("error", "No campground found!");
        return res.redirect("/campgrounds");
    }

    res.render("campgrounds/edit", { campground });
};

export const updateCampground = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });

    const imgs = req.files.map(f => ({
        url: f.path,
        filename: f.filename
    }));

    campground.images.push(...imgs);
    await campground.save();

    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });
    }

    req.flash("success", "Campground has been successfully updated!");
    res.redirect(`/campgrounds/${campground._id}`);
};

export const deleteCampground = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);

    req.flash("success", "You've successfully deleted a campground!");
    res.redirect("/campgrounds");
};