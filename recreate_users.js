require('dotenv').config();
const mongoose = require("mongoose");
const User = require("./models/user");

const MONGO_URL = process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/wanderlust";

async function main() {
    try {
        await mongoose.connect(MONGO_URL);
        console.log("Connected to DB");

        // Helper to forcefully delete and recreate a user
        async function setupUser(username, email, role, password) {
            await User.deleteOne({ username });
            console.log(`Deleted old user '${username}' if it existed.`);
            
            let user = new User({ username, email, role });
            await User.register(user, password);
            console.log(`Created NEW user '${username}' with role '${role}' and password '${password}'.`);
        }

        // Setup the three dashboard users by completely wiping old variants
        await setupUser("admin_demo", "admin@wanderlust.com", "admin", "admin123");
        await setupUser("host_demo", "host@wanderlust.com", "host", "host123");
        await setupUser("user_demo", "user@wanderlust.com", "user", "user123");

    } catch (err) {
        console.error(err);
    } finally {
        mongoose.connection.close();
    }
}

main();
