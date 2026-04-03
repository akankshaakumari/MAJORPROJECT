const Roommate = require("../models/roommate.js");

module.exports.index = async (req, res) => {
    // Sort by newest first
    let allRequests = await Roommate.find({}).populate("author").sort({ createdAt: -1 });
    let myRequests = [];
    let matches = [];

    if (req.user) {
        myRequests = await Roommate.find({ author: req.user._id });

        if (myRequests.length > 0) {
            // Find perfect matches
            matches = allRequests.filter(otherReq => {
                // Don't match with our own requests
                if (otherReq.author._id.equals(req.user._id)) return false;

                // Check against all of my active requests
                return myRequests.some(myReq => {
                    // 1. City match (case insensitive)
                    if (myReq.city.trim().toLowerCase() !== otherReq.city.trim().toLowerCase()) return false;
                    
                    // 2. Dates must overlap (start1 <= end2 AND end1 >= start2)
                    if (myReq.startDate > otherReq.endDate || myReq.endDate < otherReq.startDate) return false;

                    // 3. Gender expectations
                    if (myReq.prefGender !== "Any" && otherReq.myGender !== myReq.prefGender) return false;
                    if (otherReq.prefGender !== "Any" && myReq.myGender !== otherReq.prefGender) return false;

                    return true;
                });
            });
        }
    }

    res.render("roommates/index.ejs", { allRequests, myRequests, matches });
};

module.exports.renderNewForm = (req, res) => {
    res.render("roommates/new.ejs");
};

module.exports.createRequest = async (req, res) => {
    try {
        const newRequest = new Roommate(req.body.roommate);
        newRequest.author = req.user._id;
        await newRequest.save();
        
        req.flash("success", "Roommate Request posted! Matchmaking initiated 🪄");
        res.redirect("/roommates");
    } catch(e) {
        req.flash("error", e.message);
        res.redirect("/roommates/new");
    }
};

module.exports.destroyRequest = async (req, res) => {
    let { id } = req.params;
    await Roommate.findByIdAndDelete(id);
    req.flash("success", "Roommate Request removed!");
    res.redirect("/roommates");
};
