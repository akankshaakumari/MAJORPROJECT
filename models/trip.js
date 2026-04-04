const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const tripSchema = new Schema({
    title: { type: String, required: true },
    members: [{
        user: { type: Schema.Types.ObjectId, ref: "User" },
        arrivalTime: Date,
        contactInfo: String,
        status: { type: String, enum: ["pending", "joined"], default: "pending" }
    }],
    planner: [{
        day: Number,
        date: Date,
        places: [{
            name: String,
            notes: String
        }]
    }],
    expenses: [{
        description: String,
        amount: Number,
        category: { type: String, enum: ["Food", "Cab", "Tickets", "Other"], default: "Other" },
        paidBy: { type: Schema.Types.ObjectId, ref: "User" },
        splitAmong: [{ type: Schema.Types.ObjectId, ref: "User" }],
        date: { type: Date, default: Date.now }
    }],
    packingList: [{
        item: String,
        isPacked: { type: Boolean, default: false },
        assignedTo: { type: Schema.Types.ObjectId, ref: "User" }
    }],
    groceryList: [{
        item: String,
        isBought: { type: Boolean, default: false },
        assignedTo: { type: Schema.Types.ObjectId, ref: "User" }
    }],
    roomRules: {
        rules: [String],
        agreedBy: [{ type: Schema.Types.ObjectId, ref: "User" }]
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Trip", tripSchema);
