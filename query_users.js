require('dotenv').config();
const mongoose = require("mongoose");
const User = require("./models/user");

const MONGO_URL = process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/wanderlust";

async function main() {
    try {
        await mongoose.connect(MONGO_URL);
        console.log("Connected to DB");
        const users = await User.find({}, { username: 1, email: 1, role: 1 });
        console.log("USERS IN DB:", JSON.stringify(users, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        mongoose.connection.close();
    }
}

main();
