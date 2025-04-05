const User = require("../models/user");

module.exports.renderSignUpForm = (req, res) => {
    res.render("users/signUp");
}

module.exports.signUp = async (req, res, next) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const signedUpUser = await User.register(user, password);
        req.login(signedUpUser, err => {
            if (err) return next(err);
            req.flash("success", "welcome to yelpcamp");
            res.redirect("/campgrounds");
        })

    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/signUp");
    }
}

module.exports.renderLoginForm = (req, res) => {
    res.render("users/login");
}

module.exports.loginAuthorize = (req, res) => {
    req.flash("success", "welcome back, again!");
    const redirectUrl = req.session.returnTo || "/campgrounds";
    delete req.session.returnTo;
    res.redirect(redirectUrl);
}

module.exports.logout = (req, res, next) => {
    req.logout(err => {
        if (err) return next(err);
        req.flash("success", "You've logged out. We don't like to say goodbye. We'll see you, again!");
        res.redirect("/");
    });
}