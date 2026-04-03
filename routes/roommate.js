const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, validateRoommate } = require("../middleware.js");
const roommateController = require("../controllers/roommates.js");

router.route("/")
    .get(wrapAsync(roommateController.index))
    .post(isLoggedIn, validateRoommate, wrapAsync(roommateController.createRequest));

router.get("/new", isLoggedIn, roommateController.renderNewForm);

router.delete("/:id", isLoggedIn, wrapAsync(roommateController.destroyRequest));

module.exports = router;
