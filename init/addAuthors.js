const mongoose = require("mongoose");
const Review = require("../models/review.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

const names = [
    "Alice", "Bob", "Charlie", "David", "Eve", "Frank", "Grace", "Heidi",
    "Ivan", "Judy", "Mallory", "Niaj", "Olivia", "Peggy", "Rupert", "Sybil",
    "Ted", "Victor", "Walter", "Zoe"
];

async function main() {
    await mongoose.connect(MONGO_URL);
    console.log("Connected to DB");

    const reviews = await Review.find({});
    console.log(`Found ${reviews.length} reviews`);

    for (let review of reviews) {
        const randomName = names[Math.floor(Math.random() * names.length)];
        review.author = randomName;
        await review.save();
        console.log(`Updated review ${review._id} with author ${randomName}`);
    }

    console.log("All reviews updated with authors.");
    mongoose.connection.close();
}

main().catch(err => {
    console.log(err);
});
