const express = require("express");
const router = express.Router();
const { isLoggedIn, isAdmin } = require("../middleware");
const User = require("../models/user");
const Listing = require("../models/listing");
const Booking = require("../models/booking");
const Report = require("../models/report");
const Coupon = require("../models/coupon");
const TravelEvent = require("../models/event");
const Roommate = require("../models/roommate");

// Apply middleware to all admin routes
router.use(isLoggedIn, isAdmin);

router.get("/", async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const pendingApprovals = await Listing.countDocuments({ status: "pending" });
        const activeReports = await Report.countDocuments({ status: "pending" });
        
        // Detailed Analytics
        const totalBookings = await Booking.countDocuments();
        let totalRevenue = 0;
        const allBookings = await Booking.find({});
        allBookings.forEach(b => { totalRevenue += (b.totalPrice || 0); });
        const platformRevenue = totalRevenue * 0.10;

        // Recently Joined Users
        const latestUsers = await User.find({}).sort({ _id: -1 }).limit(5);

        // Analytics - Listings by Category
        const categoryDataRaw = await Listing.aggregate([
            { $group: { _id: "$category", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        
        let categoryLabels = [];
        let categoryCounts = [];
        categoryDataRaw.forEach(item => {
            if (item._id) {
                categoryLabels.push(item._id);
                categoryCounts.push(item.count);
            }
        });

        res.render("dashboards/admin/index", { 
            dashboardType: "admin", activePath: "overview", pageTitle: "Admin Console",
            totalUsers, pendingApprovals, activeReports, platformRevenue, totalBookings,
            latestUsers,
            categoryLabels: JSON.stringify(categoryLabels),
            categoryCounts: JSON.stringify(categoryCounts)
        });
    } catch(e) {
        req.flash('error', 'Error loading admin overview');
        res.redirect('/listings');
    }
});

router.get("/users", async (req, res) => {
    try {
        const users = await User.find({});
        res.render("dashboards/admin/users", { 
            dashboardType: "admin", activePath: "users", pageTitle: "Manage Users",
            users 
        });
    } catch(e) {
        req.flash('error', 'Error loading users');
        res.redirect('/dashboard/admin');
    }
});

router.get("/approvals", async (req, res) => {
    try {
        const pendingListings = await Listing.find({ status: "pending" }).populate("owner");
        res.render("dashboards/admin/approvals", { 
            dashboardType: "admin", activePath: "approvals", pageTitle: "Property Approvals",
            pendingListings 
        });
    } catch(e) {
        req.flash('error', 'Error loading approvals');
        res.redirect('/dashboard/admin');
    }
});

router.get("/reports", async (req, res) => {
    try {
        const activeReports = await Report.find({ status: { $in: ["pending", "investigating"] } })
                                          .populate("reportedBy")
                                          .populate("reportedUser")
                                          .populate("reportedListing");
        const resolvedReports = await Report.find({ status: { $in: ["resolved", "dismissed"] } })
                                            .populate("reportedBy");

        res.render("dashboards/admin/reports", { 
            dashboardType: "admin", activePath: "reports", pageTitle: "Reports & Complaints",
            activeReports, resolvedReports 
        });
    } catch(e) {
        req.flash('error', 'Error loading reports');
        res.redirect('/dashboard/admin');
    }
});

router.get("/analytics", async (req, res) => {
    try {
        res.render("dashboards/admin/analytics", { dashboardType: "admin", activePath: "analytics", pageTitle: "Analytics" });
    } catch(e) {
        res.redirect('/dashboard/admin');
    }
});

router.get("/promotions", async (req, res) => {
    try {
        const coupons = await Coupon.find({});
        res.render("dashboards/admin/promotions", { 
            dashboardType: "admin", activePath: "promotions", pageTitle: "Coupons & Promos",
            coupons
        });
    } catch(e) {
        req.flash('error', 'Error loading promotions');
        res.redirect('/dashboard/admin');
    }
});

router.get("/events", async (req, res) => {
    try {
        const events = await TravelEvent.find({}).populate("organizer");
        res.render("dashboards/admin/events", { 
            dashboardType: "admin", activePath: "events", pageTitle: "Travel Events",
            events 
        });
    } catch(e) {
        req.flash('error', 'Error loading events');
        res.redirect('/dashboard/admin');
    }
});

// Approve Listing
router.post("/approvals/:id/approve", async (req, res) => {
    try {
        const { id } = req.params;
        await Listing.findByIdAndUpdate(id, { status: "approved" });
        req.flash("success", "Listing Approved Successfully!");
        res.redirect("/dashboard/admin/approvals");
    } catch(e) {
        req.flash("error", "Error approving listing");
        res.redirect("/dashboard/admin/approvals");
    }
});

// Reject Listing
router.post("/approvals/:id/reject", async (req, res) => {
    try {
        const { id } = req.params;
        await Listing.findByIdAndUpdate(id, { status: "rejected" });
        req.flash("error", "Listing Rejected.");
        res.redirect("/dashboard/admin/approvals");
    } catch(e) {
        req.flash("error", "Error rejecting listing");
        res.redirect("/dashboard/admin/approvals");
    }
});

// Verify User
router.post("/users/:id/verify", async (req, res) => {
    try {
        const { id } = req.params;
        await User.findByIdAndUpdate(id, { "profile.verificationStatus": "verified" });
        req.flash("success", "User Verified!");
        res.redirect("/dashboard/admin/users");
    } catch(e) {
        req.flash("error", "Error verifying user");
        res.redirect("/dashboard/admin/users");
    }
});

// Block User
router.post("/users/:id/block", async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        user.isBlocked = !user.isBlocked;
        await user.save();
        req.flash("success", user.isBlocked ? "User Blocked" : "User Unblocked");
        res.redirect("/dashboard/admin/users");
    } catch(e) {
        req.flash("error", "Error blocking user");
        res.redirect("/dashboard/admin/users");
    }
});

// Add Coupon
router.post("/promotions", async (req, res) => {
    try {
        const newCoupon = new Coupon(req.body.coupon);
        await newCoupon.save();
        req.flash("success", "New Coupon Created!");
        res.redirect("/dashboard/admin/promotions");
    } catch(e) {
        req.flash("error", "Error creating coupon");
        res.redirect("/dashboard/admin/promotions");
    }
});

// Add Travel Event
router.post("/events", async (req, res) => {
    try {
        const newEvent = new TravelEvent(req.body.event);
        newEvent.organizer = req.user._id;
        await newEvent.save();
        req.flash("success", "New Travel Event Added!");
        res.redirect("/dashboard/admin/events");
    } catch(e) {
        req.flash("error", "Error creating event");
        res.redirect("/dashboard/admin/events");
    }
});

// --- ROOMMATE MANAGEMENT ROUTES ---

// Roommate Hub Overview
router.get("/roommates", async (req, res) => {
    try {
        const totalRequests = await Roommate.countDocuments();
        const activeMatches = await Roommate.countDocuments({ status: "matched" });
        const pendingVerification = await User.countDocuments({ "profile.verificationStatus": "pending" });
        
        // Stats for Chart
        const cityStats = await Roommate.aggregate([
            { $group: { _id: "$city", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);

        res.render("dashboards/admin/roommates/index", {
            dashboardType: "admin", activePath: "roommates", pageTitle: "Roommate Hub",
            totalRequests, activeMatches, pendingVerification,
            cityLabels: JSON.stringify(cityStats.map(s => s._id)),
            cityCounts: JSON.stringify(cityStats.map(s => s.count))
        });
    } catch(e) {
        req.flash("error", "Error loading Roommate Hub");
        res.redirect("/dashboard/admin");
    }
});

// All Roommate Requests
router.get("/roommates/requests", async (req, res) => {
    try {
        const { status } = req.query;
        let query = {};
        if (status) query.status = status;
        
        const requests = await Roommate.find(query).populate("author");
        res.render("dashboards/admin/roommates/requests", {
            dashboardType: "admin", activePath: "roommates", pageTitle: "All Requests",
            requests, currentFilter: status
        });
    } catch(e) {
        req.flash("error", "Error loading requests");
        res.redirect("/dashboard/admin/roommates");
    }
});

// Shared Bookings Monitor
router.get("/roommates/bookings", async (req, res) => {
    try {
        const sharedBookings = await Booking.find({ isRoommateShared: true })
                                           .populate("user")
                                           .populate("roommatePartner")
                                           .populate("listing");
        res.render("dashboards/admin/roommates/bookings", {
            dashboardType: "admin", activePath: "roommates", pageTitle: "Shared Bookings",
            sharedBookings
        });
    } catch(e) {
        req.flash("error", "Error loading shared bookings");
        res.redirect("/dashboard/admin/roommates");
    }
});

// Identity Verification Panel
router.get("/roommates/identity", async (req, res) => {
    try {
        const pendingUsers = await User.find({ "profile.verificationStatus": "pending" });
        res.render("dashboards/admin/roommates/identity", {
            dashboardType: "admin", activePath: "roommates", pageTitle: "Identity Verification",
            pendingUsers
        });
    } catch(e) {
        req.flash("error", "Error loading verification panel");
        res.redirect("/dashboard/admin/roommates");
    }
});

// Verify Action
router.post("/roommates/verify/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'verified' or 'rejected'
        const isVerified = status === 'verified';
        
        await User.findByIdAndUpdate(id, { 
            "profile.verificationStatus": status,
            isTravelerVerified: isVerified
        });
        
        req.flash("success", `User verification ${status}`);
        res.redirect("/dashboard/admin/roommates/identity");
    } catch(e) {
        req.flash("error", "Error processing verification");
        res.redirect("/dashboard/admin/roommates/identity");
    }
});

module.exports = router;
