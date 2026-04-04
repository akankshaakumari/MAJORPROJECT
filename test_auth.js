require('dotenv').config();
const mongoose = require("mongoose");
const User = require("./models/user");
const passportLocalMongoose = require("passport-local-mongoose");

const MONGO_URL = process.env.ATLASDB_URL;

async function testAuth() {
    try {
        await mongoose.connect(MONGO_URL);
        console.log("Connected to DB:", MONGO_URL.substring(0, 30) + '...');
        
        let user = await User.findOne({ username: "admin_demo" });
        console.log("User object found in DB:", user ? "YES!" : "NO!");
        if(user) {
            console.log("User's salt exists?", !!user.salt);
            console.log("User's hash exists?", !!user.hash);
        }

        const authenticate = User.authenticate();
        authenticate("admin_demo", "admin123", (err, result, error) => {
            console.log("Authentication Result:", { err, result: !!result, error: error ? error.message : null });
            mongoose.connection.close();
        });

    } catch (err) {
        console.error(err);
    }
}

testAuth();
