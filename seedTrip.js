const mongoose = require("mongoose");
const Trip = require("./models/trip");
const User = require("./models/user");
require('dotenv').config();

const dbUrl = process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/wanderlust";

async function seed() {
    await mongoose.connect(dbUrl);
    console.log("Connected to DB for seeding trip...");

    // Find some users to add to the trip
    const users = await User.find({}).limit(3);
    if(users.length < 1) {
        console.log("No users found to create a trip. Please sign up some users first.");
        return process.exit();
    }

    const demoTrip = new Trip({
        title: "Goa Beach Expedition 2026 🌴",
        members: users.map(u => ({
            user: u._id,
            arrivalTime: new Date(Date.now() + 86400000 * 2), // 2 days from now
            contactInfo: "+91-98765-43210",
            status: "joined"
        })),
        planner: [
            {
                day: 1,
                places: [{ name: "Calangute Beach 🏖️", notes: "Sunset viewing and dinner at the shack." }]
            },
            {
                day: 2,
                places: [{ name: "Fort Aguada 🏰", notes: "History tour and lighthouse visit." }]
            }
        ],
        expenses: [
            {
                description: "Luxury Cab from Airport",
                amount: 1500,
                category: "Cab",
                paidBy: users[0]._id,
                date: new Date()
            },
            {
                description: "Beach Shack Dinner",
                amount: 3200,
                category: "Food",
                paidBy: users[users.length - 1]._id,
                date: new Date()
            }
        ],
        packingList: [
            { item: "Portable Speaker", assignedTo: users[0]._id, isPacked: true },
            { item: "Sunscreen SPF 50", assignedTo: users[users.length - 1]._id, isPacked: false }
        ],
        groceryList: [
            { item: "Mineral Water (10L)", assignedTo: users[0]._id, isBought: false },
            { item: "Chips & Snacks", assignedTo: users[users.length - 1]._id, isBought: true }
        ],
        roomRules: {
            rules: ["No loud music after 11 PM", "Shared kitchen cleaning daily", "No outside guests"],
            agreedBy: [users[0]._id]
        }
    });

    await demoTrip.save();
    console.log("✅ Demo Trip Created Successfully!");
    console.log("Trip ID:", demoTrip._id);
    console.log("Use this URL to view: http://localhost:8080/dashboard/trip/" + demoTrip._id);
    
    process.exit();
}

seed();
