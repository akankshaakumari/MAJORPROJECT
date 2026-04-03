const Listing = require("../models/listing.js");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN || "MAP_TOKEN";
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req, res) => {
    let { category, search } = req.query;
    let query = {};
    if (category) {
        query.category = category;
    }
    if (search) {
        query.$or = [
            { title: { $regex: search, $options: "i" } },
            { location: { $regex: search, $options: "i" } },
            { country: { $regex: search, $options: "i" } }
        ];
    }
    const allListings = await Listing.find(query);
    res.render("./listings/index.ejs", { allListings, currentCategory: category });
};

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate({
        path: "reviews",
        populate: {
            path: "author"
        }
    }).populate("owner");
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }
    res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res, next) => {
    let mapLat = req.body.listing.lat;
    let mapLng = req.body.listing.lng;
    
    let coordinates = [];
    
    if (mapLat && mapLng) {
        coordinates = [parseFloat(mapLng), parseFloat(mapLat)];
    } else {
        let response = await geocodingClient.forwardGeocode({
            query: req.body.listing.location + ", " + req.body.listing.country,
            limit: 1
        }).send();
        
        if (response.body.features.length) {
            coordinates = response.body.features[0].geometry.coordinates;
        } else {
            coordinates = [77.2090, 28.6139];
        }
    }

    const newListing = new Listing(req.body.listing);
    newListing.geometry = { type: 'Point', coordinates: coordinates };

    if(typeof req.file !== "undefined") {
        let url = "/uploads/" + req.file.filename;
        let filename = req.file.filename;
        newListing.image = { url, filename };
    }
    newListing.owner = req.user._id;
    await newListing.save();
    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }
    res.render("listings/edit.ejs", { listing })
};

module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    
    let mapLat = req.body.listing.lat;
    let mapLng = req.body.listing.lng;
    
    if (mapLat && mapLng) {
        listing.geometry = { type: 'Point', coordinates: [parseFloat(mapLng), parseFloat(mapLat)] };
    } else {
        // Compute new coordinates
        let response = await geocodingClient.forwardGeocode({
            query: req.body.listing.location + ", " + req.body.listing.country,
            limit: 1
        }).send();
        if (response.body.features.length) {
            listing.geometry = response.body.features[0].geometry;
        } else {
            listing.geometry = { type: 'Point', coordinates: [77.2090, 28.6139] };
        }
    }

    if(typeof req.file !== "undefined") {
        let url = "/uploads/" + req.file.filename;
        let filename = req.file.filename;
        listing.image = { url, filename };
    }
    await listing.save();
    
    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("error", "Listing Deleted!");
    res.redirect("/listings");
};
