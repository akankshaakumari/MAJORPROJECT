const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing  = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main().then(()=>{
    console.log("connected to DB");
}).catch(err => {
    console.log(err);
});
async function main(){
    await mongoose.connect(MONGO_URL);
}

const User = require("../models/user.js");

const initDB = async () => {
    await Listing.deleteMany({});
    
    // Create a new user or find an existing one to own all the default listings
    let defaultUser = await User.findOne({ username: "admin_seed" });
    if (!defaultUser) {
        const newUser = new User({ email: "admin@example.com", username: "admin_seed" });
        defaultUser = await User.register(newUser, "admin123");
    }

    // Assign this user as the owner for all listings
    const updatedData = initData.data.map((obj) => ({
        ...obj,
        owner: defaultUser._id,
    }));

    await Listing.insertMany(updatedData);
    console.log("data was initialized");
}

initDB();
