const Listing = require("../models/listing");
const Booking = require("../models/booking");
const Review = require("../models/review");
const User = require("../models/user");

module.exports.index = async (req, res) => {
    const myListings = await Listing.find({ owner: req.user._id });
    const listingIds = myListings.map(l => l._id);
    
    // Stats
    const totalBookings = await Booking.countDocuments({ listing: { $in: listingIds } });
    const pendingBookings = await Booking.countDocuments({ listing: { $in: listingIds }, status: "pending" });
    
    const allBookings = await Booking.find({ listing: { $in: listingIds }, status: { $ne: "rejected" } });
    const totalEarnings = allBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
    
    // Monthly growth (mock)
    const monthlyEarnings = totalEarnings * 0.4; // 40% of total for demonstration
    const occupancyRate = myListings.length > 0 ? 65 : 0; // 65% mock occupancy

    res.render("dashboards/host/index", { 
        dashboardType: "host", activePath: "overview", pageTitle: "Host Overview",
        activeListingsCount: myListings.length,
        totalBookings,
        pendingBookings,
        totalEarnings,
        monthlyEarnings,
        occupancyRate
    });
};

module.exports.properties = async (req, res) => {
    const myListings = await Listing.find({ owner: req.user._id }).populate('reviews');
    res.render("dashboards/host/properties", { 
        dashboardType: "host", activePath: "properties", pageTitle: "My Properties",
        myListings
    });
};

module.exports.bookings = async (req, res) => {
    const myListings = await Listing.find({ owner: req.user._id }, '_id');
    const listingIds = myListings.map(l => l._id);
    
    const now = new Date();
    const pendingRequests = await Booking.find({ listing: { $in: listingIds }, status: "pending" }).populate('listing').populate('user');
    const upcomingGuests = await Booking.find({ listing: { $in: listingIds }, status: "confirmed", checkIn: { $gte: now } }).populate('listing').populate('user');
    const pastGuests = await Booking.find({ listing: { $in: listingIds }, status: { $in: ["confirmed", "completed"] }, checkIn: { $lt: now } }).populate('listing').populate('user');

    res.render("dashboards/host/bookings", { 
        dashboardType: "host", activePath: "bookings", pageTitle: "Booking Management",
        pendingRequests, upcomingGuests, pastGuests
    });
};

module.exports.updateBookingStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body; // 'confirmed' or 'rejected'
    
    await Booking.findByIdAndUpdate(id, { status });
    req.flash("success", `Booking ${status === 'confirmed' ? 'Accepted' : 'Rejected'} successfully.`);
    res.redirect("/dashboard/host/bookings");
};

module.exports.earnings = async (req, res) => {
    const myListings = await Listing.find({ owner: req.user._id }, '_id');
    const listingIds = myListings.map(l => l._id);
    const bookings = await Booking.find({ listing: { $in: listingIds }, status: { $in: ["confirmed", "completed"] } }).populate('listing');
    
    const totalRevenue = bookings.reduce((sum, b) => sum + b.totalPrice, 0);
    
    res.render("dashboards/host/earnings", { 
        dashboardType: "host", activePath: "earnings", pageTitle: "Earnings Dashboard",
        totalRevenue,
        bookings
    });
};

module.exports.pricing = async (req, res) => {
    const myListings = await Listing.find({ owner: req.user._id });
    res.render("dashboards/host/pricing", { 
        dashboardType: "host", activePath: "pricing", pageTitle: "Pricing Strategy",
        myListings
    });
};

module.exports.updatePricingRules = async (req, res) => {
    const { id } = req.params;
    const { weekendPrice, festivalPrice, longStayDiscount } = req.body;
    
    await Listing.findByIdAndUpdate(id, {
        "specialPricing.weekendPrice": weekendPrice,
        "specialPricing.festivalPrice": festivalPrice,
        "specialPricing.longStayDiscount": longStayDiscount
    });
    
    req.flash("success", "Pricing Rules Updated!");
    res.redirect("/dashboard/host/pricing");
};

module.exports.reviews = async (req, res) => {
    const myListings = await Listing.find({ owner: req.user._id }).populate({ path: 'reviews', populate: { path: 'author' } });
    
    let allReviews = [];
    for(let lst of myListings) {
        for(let rev of lst.reviews) {
            allReviews.push({ listing: lst, review: rev });
        }
    }
    
    res.render("dashboards/host/reviews", { 
        dashboardType: "host", activePath: "reviews", pageTitle: "Guest Feedback",
        allReviews
    });
};

module.exports.chat = async (req, res) => {
    // Basic chat rendering
    res.render("dashboards/host/chat", { 
        dashboardType: "host", activePath: "chat", pageTitle: "Guest Concierge" 
    });
};
