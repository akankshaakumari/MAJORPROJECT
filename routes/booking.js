const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn } = require("../middleware.js");
const bookingController = require("../controllers/bookings.js");

router.route("/")
    .get(isLoggedIn, wrapAsync(bookingController.index))
    .post(isLoggedIn, wrapAsync(bookingController.createBooking));

router.delete("/:id", isLoggedIn, wrapAsync(bookingController.destroyBooking));

module.exports = router;
