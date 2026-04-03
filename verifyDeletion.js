const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const Review = require("./models/review.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

async function main() {
    await mongoose.connect(MONGO_URL);
    console.log("Connected to DB");

    // 1. Create a dummy listing with a review
    const newReview = new Review({ comment: "To be deleted", rating: 1 });
    await newReview.save();

    const newListing = new Listing({
        title: "Delete Me",
        description: "Test listing",
        location: "Test",
        country: "Test",
        price: 100,
        reviews: [newReview._id]
    });
    await newListing.save();
    console.log(`Created listing ${newListing._id} with review ${newReview._id}`);

    // 2. Delete the listing
    await Listing.findByIdAndDelete(newListing._id);
    console.log("Deleted listing");

    // 3. Check if review still exists
    const reviewCheck = await Review.findById(newReview._id);
    if (!reviewCheck) {
        console.log("SUCCESS: Review was automatically deleted.");
    } else {
        console.log("FAILURE: Review still exists.");
    }

    mongoose.connection.close();
}

main().catch(err => console.log(err));
