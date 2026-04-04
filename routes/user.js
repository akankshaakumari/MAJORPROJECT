const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");
const userController = require("../controllers/users.js");

router.route("/signup")
    .get(userController.renderSignupForm)
    .post(wrapAsync(userController.signup));

router.route("/login")
    .get(userController.renderLoginForm)
    .post(
        saveRedirectUrl,
        passport.authenticate("local", {
            failureRedirect: "/login",
            failureFlash: true
        }),
        userController.login
    );

router.get("/logout", userController.logout);

// Forgot Password Routes
router.route("/forgot-password")
    .get(userController.renderForgotPasswordForm)
    .post(wrapAsync(userController.forgotPassword));

router.route("/verify-otp")
    .get(userController.renderVerifyOTPForm)
    .post(wrapAsync(userController.verifyOTP));

router.route("/reset-password")
    .post(wrapAsync(userController.resetPassword));

module.exports = router;