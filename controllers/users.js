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

// --- FORGOT PASSWORD FLOW ---

module.exports.renderForgotPasswordForm = (req, res) => {
    res.render("users/forgotPassword.ejs");
};

module.exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
        req.flash("error", "No account with that email address exists.");
        return res.redirect("/forgot-password");
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordOTP = otp;
    user.resetPasswordExpires = Date.now() + 600000; // 10 minutes
    await user.save();

    // FALLBACK: If no email credentials, skip sending and show test OTP hint
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn("⚠️ [AUTH] EMAIL_USER or EMAIL_PASS missing. Using test OTP: 111111");
        user.resetPasswordOTP = "111111"; // Override with easy code for testing
        await user.save();
        req.flash("success", "Developer Mode: Use 111111 as your verification code.");
        return res.redirect("/verify-otp?email=" + email);
    }

    // Send Real Email with Timeout
    const nodemailer = require("nodemailer");
    const transporter = nodemailer.createTransport({
        service: "gmail",
        connectionTimeout: 10000, // 10 seconds
        greetingTimeout: 10000,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const mailOptions = {
        from: `"WanderLust Support" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: "WanderLust Password Reset OTP",
        html: `
            <div style="font-family: sans-serif; max-width: 500px; margin: auto; padding: 25px; border: 1px solid #f0f0f0; border-radius: 12px; text-align: center;">
                <h2 style="color: #fe424d;">Verification Code</h2>
                <p>Hello <strong>${user.username}</strong>, your request to reset your password is approved.</p>
                <div style="background: #f8f9fa; padding: 20px; font-size: 32px; font-weight: 800; letter-spacing: 5px; color: #fe424d; border-radius: 8px; margin: 25px 0;">
                    ${otp}
                </div>
                <p style="color: #6c757d; font-size: 13px;">Valid for 10 minutes. If you didn't request this, ignore this email.</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        req.flash("success", "A secure code has been sent to your inbox.");
        res.redirect("/verify-otp?email=" + email);
    } catch (err) {
        console.error("❌ [MAIL ERROR]:", err.message);
        // Robust Fallback: Let user use a fixed code so they aren't stuck
        user.resetPasswordOTP = "111111";
        await user.save();
        req.flash("error", "Email service is taking too long. Using emergency code: 111111");
        res.redirect("/verify-otp?email=" + email);
    }
};

module.exports.renderVerifyOTPForm = (req, res) => {
    const { email } = req.query;
    res.render("users/verifyOTP.ejs", { email });
};

module.exports.verifyOTP = async (req, res) => {
    const { email, otp } = req.body;
    const user = await User.findOne({ 
        email, 
        resetPasswordOTP: otp,
        resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
        req.flash("error", "Invalid or expired OTP.");
        return res.redirect("/verify-otp?email=" + email);
    }

    res.render("users/resetPassword.ejs", { email, otp });
};

module.exports.resetPassword = async (req, res) => {
    const { email, otp, password, confirmPassword } = req.body;
    
    if (password !== confirmPassword) {
        req.flash("error", "Passwords do not match.");
        return res.render("users/resetPassword.ejs", { email, otp });
    }

    const user = await User.findOne({ 
        email, 
        resetPasswordOTP: otp,
        resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
        req.flash("error", "Unauthorized password reset attempt.");
        return res.redirect("/login");
    }

    await user.setPassword(password);
    user.resetPasswordOTP = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    req.flash("success", "Password reset successful! You can now log in.");
    res.redirect("/login");
};
