const express = require("express");
const router = express.Router();
const { isLoggedIn } = require("../middleware");
const userDashboardController = require("../controllers/userDashboard");

// Dashboard Overview
router.get("/", isLoggedIn, userDashboardController.index);

// My Bookings
router.get("/bookings", isLoggedIn, userDashboardController.bookings);
router.post("/bookings/:id/cancel", isLoggedIn, userDashboardController.cancelBooking);

// My Wishlist
router.get("/wishlist", isLoggedIn, userDashboardController.wishlist);

// Buddy Requests
router.get("/buddy-requests", isLoggedIn, userDashboardController.buddyRequests);

// Messages
router.get("/messages", isLoggedIn, userDashboardController.messages);

// Reviews
router.get("/reviews", isLoggedIn, userDashboardController.reviews);

const multer  = require('multer');
const path = require('path');
const fs = require('fs');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, '../public/uploads/');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + '-' + file.originalname)
  }
})
const upload = multer({ storage });

// Profile & Verification
router.get("/reviews", isLoggedIn, userDashboardController.reviews);
router.get("/profile", isLoggedIn, userDashboardController.profile);
router.get("/ai-suggestions", isLoggedIn, userDashboardController.aiSuggestions);
router.post("/profile/update", isLoggedIn, upload.single('profileImage'), userDashboardController.updateProfile);

module.exports = router;
