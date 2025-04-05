const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/user");
const catchAsync = require("../utilities/catchAsync");
const users = require("../controllers/users");

router.route("/signUp")
    .get(users.renderSignUpForm)
    .post(catchAsync(users.signUp));

router.route("/login")
    .get(users.renderLoginForm)
    .post(passport.authenticate("local",
        {
            failureFlash: true,
            failureRedirect: "/login",
            keepSessionInfo: true
        }),
        users.loginAuthorize);

router.get("/logout", users.logout);

module.exports = router;