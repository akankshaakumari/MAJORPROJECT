const User = require("../models/user.js");

module.exports.renderSignupForm = (req, res) => {
    res.render("users/signup.ejs");
};

module.exports.signup = async (req, res, next) => {
    try {
        let { username, email, password, role } = req.body;
        if (!role || !['user', 'host', 'admin'].includes(role)) {
            role = 'user';
        }
        let user = new User({ email, username, role });
        let registeredUser = await User.register(user, password);
        console.log(registeredUser);
        req.login(registeredUser, (err) => {
            if (err) {
                return next(err);
            }
            req.flash("success", `Welcome to Wanderlust! Logged in as ${role}`);
            
            // Redirect based on role to their specific dashboard
            if (role === 'admin') return res.redirect('/dashboard/admin');
            if (role === 'host') return res.redirect('/dashboard/host');
            res.redirect("/dashboard/user");
        });
    } catch (error) {
        req.flash("error", error.message);
        res.redirect("/signup");
    }
};

module.exports.renderLoginForm = (req, res) => {
    res.render("users/login.ejs");
};

module.exports.login = async (req, res) => {
    req.flash("success", "Welcome back to Wanderlust!");
    const role = req.user.role;
    let redirectUrl = res.locals.redirectUrl;
    
    if (!redirectUrl) {
        if (role === 'admin') redirectUrl = '/dashboard/admin';
        else if (role === 'host') redirectUrl = '/dashboard/host';
        else redirectUrl = '/listings';
    }
    
    res.redirect(redirectUrl);
};

module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "you are logged out!");
        res.redirect("/listings");
    });
};
