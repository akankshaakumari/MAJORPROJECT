const express = require("express");
const router = express.Router();

//index
router.get("/", (req, res) => {
    res.render("pages.ejs", { name: "Post" });
});
//show
router.get("/:id", (req, res) => {
    res.send("hi i am post id");
});
//post
router.post("/", (req, res) => {
    req.flash("success", "new post added successfully!");
    res.redirect("/posts");
});
//delete
    router.delete("/:id", (req, res) => {
    res.send("hi i am post delete");
});

module.exports = router;