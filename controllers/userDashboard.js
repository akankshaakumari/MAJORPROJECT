const User = require("../models/user");
const Booking = require("../models/booking");
const Review = require("../models/review");
const Message = require("../models/message");
const Roommate = require("../models/roommate");

module.exports.index = async (req, res) => {
    const upcomingBookingsCount = await Booking.countDocuments({ user: req.user._id, status: "confirmed", checkIn: { $gte: new Date() } });
    const userObj = await User.findById(req.user._id);
    const wishlistCount = userObj.wishlist ? userObj.wishlist.length : 0;
    const buddyRequestsCount = await Roommate.countDocuments({ author: req.user._id });
    
    // Recent activity (mock)
    const recentActivity = [
        { title: "Welcome to WanderLust", desc: "Your journey starts here!", icon: "fa-door-open", time: "Just now" }
    ];

    res.render("dashboards/user/index", { 
        dashboardType: "user", activePath: "overview", pageTitle: "Overview", 
        upcomingBookingsCount, wishlistCount, buddyRequestsCount, recentActivity
    });
};

module.exports.bookings = async (req, res) => {
    const now = new Date();
    const upcomingBookings = await Booking.find({ user: req.user._id, checkIn: { $gte: now }, status: "confirmed" }).populate('listing');
    const pastBookings = await Booking.find({ user: req.user._id, $or: [{ checkIn: { $lt: now } }, { status: "completed" }] }).populate('listing');
    const cancelledBookings = await Booking.find({ user: req.user._id, status: "cancelled" }).populate('listing');
    
    res.render("dashboards/user/bookings", { 
        dashboardType: "user", activePath: "bookings", pageTitle: "My Stays",
        upcomingBookings, pastBookings, cancelledBookings
    });
};

module.exports.cancelBooking = async (req, res) => {
    const { id } = req.params;
    await Booking.findByIdAndUpdate(id, { status: "cancelled" });
    req.flash("success", "Booking cancelled successfully.");
    res.redirect("/dashboard/user/bookings");
};

module.exports.wishlist = async (req, res) => {
    const userObj = await User.findById(req.user._id).populate('wishlist');
    const items = userObj.wishlist || [];
    
    // Grouping logic (mock grouping by listing category/type)
    const groups = {
        "Dream Stays": items.filter(i => i.price > 5000),
        "Budget Friendly": items.filter(i => i.price <= 5000),
        "Beach & Nature": items.filter(i => i.location.toLowerCase().includes("beach") || i.location.toLowerCase().includes("forest")),
        "General": items.filter(i => i.price > 0) // fallback
    };

    res.render("dashboards/user/wishlist", { 
        dashboardType: "user", activePath: "wishlist", pageTitle: "My Wishlist",
        groups
    });
};

module.exports.buddyRequests = async (req, res) => {
    const requests = await Roommate.find({ author: req.user._id });
    const waiting = requests.filter(r => r.status === "waiting");
    const matched = requests.filter(r => r.status === "matched");
    
    res.render("dashboards/user/buddy-requests", { 
        dashboardType: "user", activePath: "buddy-requests", pageTitle: "Buddy Requests",
        waiting, matched
    });
};

module.exports.messages = async (req, res) => {
    const messages = await Message.find({ $or: [{ sender: req.user._id }, { recipient: req.user._id }] })
                                  .populate('sender')
                                  .populate('recipient')
                                  .sort({createdAt: -1});
    res.render("dashboards/user/messages", { 
        dashboardType: "user", activePath: "messages", pageTitle: "Messages", 
        messages 
    });
};

module.exports.reviews = async (req, res) => {
    // Reviews written by me
    const myReviews = await Review.find({ author: req.user._id }).populate('listing');
    // Mock reviews from hosts (in a real app, this would be a separate model)
    const hostReviews = [
        { authorName: "Superhost Sarah", rating: 5, comment: "Excellent guest, left the place sparkling clean!", createdAt: new Date() }
    ];

    res.render("dashboards/user/reviews", { 
        dashboardType: "user", activePath: "reviews", pageTitle: "My Reviews", 
        myReviews, hostReviews 
    });
};

module.exports.profile = async (req, res) => {
    const userProfile = await User.findById(req.user._id);
    res.render("dashboards/user/profile", { 
        dashboardType: "user", activePath: "profile", pageTitle: "Profile & Verification", 
        userProfile 
    });
};

module.exports.updateProfile = async (req, res) => {
    const { name, phone, preferences } = req.body;
    const travelPreferences = Array.isArray(preferences) ? preferences : (preferences ? [preferences] : []);
    
    // Fix: Match the actual user.js schema structure
    const updateData = {
        "profile.name": name,
        "profile.phone": phone,
        "profile.travelPreferences": travelPreferences
    };

    if (req.file) {
        updateData["profile.profileImage"] = {
            url: `/uploads/${req.file.filename}`,
            filename: req.file.filename
        };
    }
    
    await User.findByIdAndUpdate(req.user._id, { $set: updateData });
    
    req.flash("success", "Profile updated successfully!");
    res.redirect("/dashboard/user/profile");
};

module.exports.aiSuggestions = async (req, res) => {
    const Listing = require("../models/listing");
    const { location } = req.query;
    
    let suggestedListings = [];
    let searchPerformed = false;

    if (location) {
        searchPerformed = true;
        // Search for APPROVED listings in this location with reviews populated
        const listings = await Listing.find({ 
            location: { $regex: location, $options: "i" },
            status: "approved"
        }).populate('reviews');

        // Smart Ranking Algorithm (The "Local AI")
        // Score = (Average Rating * 10) + (Review Count * 2)
        suggestedListings = listings.map(l => {
            const reviewCount = l.reviews.length;
            const avgRating = reviewCount > 0 
                ? l.reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviewCount 
                : 0;
            
            const aiScore = (avgRating * 10) + (reviewCount * 2);
            
            // Logic for "AI Insight"
            let insight = "Safe and reliable choice for travelers.";
            if (avgRating > 4.5 && reviewCount > 10) insight = "Highly rated 'Gem' with exceptional service consistency.";
            else if (avgRating > 4.5) insight = "Exceptional guest satisfaction based on recent stays.";
            else if (reviewCount > 20) insight = "High popularity choice with a verified track record.";

            return {
                ...l.toObject(),
                aiScore,
                avgRating,
                reviewCount,
                aiInsight: insight
            };
        }).sort((a, b) => b.aiScore - a.aiScore).slice(0, 5);
    } else {
        // Just show trending if no search
        suggestedListings = await Listing.find({ status: "approved" })
            .populate('reviews')
            .limit(3);
            
        suggestedListings = suggestedListings.map(l => ({
            ...l.toObject(),
            aiInsight: "Trending destination based on platform popularity."
        }));
    }

    res.render("dashboards/user/ai_suggestions", {
        dashboardType: "user", activePath: "ai_suggestions", pageTitle: "AI Stay Assistant",
        suggestedListings, location, searchPerformed
    });
};
