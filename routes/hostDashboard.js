const express = require("express");
const router = express.Router();
const { isLoggedIn, isHost } = require("../middleware");
const hostDashboardController = require("../controllers/hostDashboard");

// Apply middleware to all host routes
router.use(isLoggedIn, isHost);

// Dashboard Overview
router.get("/", hostDashboardController.index);

// Property Management
router.get("/properties", hostDashboardController.properties);

// Booking Management
router.get("/bookings", hostDashboardController.bookings);
router.post("/bookings/:id/status", hostDashboardController.updateBookingStatus);

// Financial Insights
router.get("/earnings", hostDashboardController.earnings);

// Pricing Strategy
router.get("/pricing", hostDashboardController.pricing);
router.post("/pricing/:id/rules", hostDashboardController.updatePricingRules);

// Guest Feedback
router.get("/reviews", hostDashboardController.reviews);

// Guest Concierge (Chat)
router.get("/chat", hostDashboardController.chat);

module.exports = router;
