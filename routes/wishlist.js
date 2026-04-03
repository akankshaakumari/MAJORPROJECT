const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn } = require("../middleware.js");
const wishlistController = require("../controllers/wishlist.js");

// View all wishlist items
router.get("/", isLoggedIn, wrapAsync(wishlistController.index));

// Toggle add/remove from wishlist
router.post("/:id", isLoggedIn, wrapAsync(wishlistController.toggleWishlist));

module.exports = router;
