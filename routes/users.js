import express from "express";
const router = express.Router();
import passport from "passport";
import User from "../models/user.js";
import catchAsync from "../utilities/catchAsync.js";
import * as users from "../controllers/users.js";
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

export default router;
