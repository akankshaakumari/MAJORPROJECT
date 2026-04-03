const express = require("express");
const router = express.Router();

//index
router.get("/", (req, res) => {
    res.render("pages.ejs", { name: "User" });
});
//show
router.get("/:id", (req, res) => {
    res.send("hi i am users id");
});
//post
router.post("/", (req, res) => {
    req.flash("success", "new user added successfully!");
    console.log("Flash set in user post route.");
    res.redirect("/users");
});
//delete
router.delete("/:id", (req, res) => {
    res.send("hi i am users delete");
});

module.exports = router;
