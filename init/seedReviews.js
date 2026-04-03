const mongoose = require("mongoose");
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

async function main() {
    await mongoose.connect(MONGO_URL);
    console.log("Connected to DB");

    const listings = await Listing.find({});
    console.log(`Found ${listings.length} listings`);

    const comments = [
        "Great place!",
        "Loved the stay.",
        "Bit noisy but okay.",
        "Fantastic view!",
        "Host was very friendly.",
        "Clean and comfortable.",
        "Would definitely come again.",
        "Not worth the price.",
        "Average experience.",
        "Best vacation ever!"
    ];

    for (let listing of listings) {
        // Create 5 to 6 reviews for each listing
        const numberOfReviews = Math.floor(Math.random() * 2) + 5; // Generates 5 or 6

        for (let i = 0; i < numberOfReviews; i++) {
            const randomComment = comments[Math.floor(Math.random() * comments.length)];
            const randomRating = Math.floor(Math.random() * 5) + 1;

            const newReview = new Review({
                comment: randomComment,
                rating: randomRating
            });

            await newReview.save();
            listing.reviews.push(newReview);
            console.log(`Added review to ${listing.title}`);
        }
        await listing.save();
    }

    console.log("All listings updated with random reviews.");
    mongoose.connection.close();
}

main().catch(err => {
    console.log(err);
});
