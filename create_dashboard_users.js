require('dotenv').config();
const mongoose = require("mongoose");
const User = require("./models/user");

const MONGO_URL = process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/wanderlust";

async function main() {
    try {
        await mongoose.connect(MONGO_URL);
        console.log("Connected to DB");

        // Helper to upsert a user with a specific role
        async function setupUser(username, email, role, password) {
            let user = await User.findOne({ username });
            if (user) {
                user.role = role;
                await user.save();
                // We cannot easily reset password directly because passport-local-mongoose uses salt/hash
                // If it already exists, just updating role is usually enough
                console.log(`Updated existing user '${username}' to role '${role}'. Password unchanged.`);
            } else {
                user = new User({ username, email, role });
                await User.register(user, password);
                console.log(`Created NEW user '${username}' with role '${role}' and password '${password}'.`);
            }
        }

        // Setup the three dashboard users
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
