const User = require("../models/user.js");
const Listing = require("../models/listing.js");

module.exports.index = async (req, res) => {
    const user = await User.findById(req.user._id).populate("wishlist");
    res.render("wishlist/index.ejs", { wishlist: user.wishlist });
};

module.exports.toggleWishlist = async (req, res) => {
    const { id } = req.params;
    const user = await User.findById(req.user._id);

    const index = user.wishlist.indexOf(id);
    if (index === -1) {
        user.wishlist.push(id);
        await user.save();
        req.flash("success", "Added to wishlist! ❤️");
    } else {
        user.wishlist.splice(index, 1);
        await user.save();
        req.flash("success", "Removed from wishlist! 💔");
    }
    
    // Redirect back to either the listing show page or the main index
    res.redirect("back");
};
