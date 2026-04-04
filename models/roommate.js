const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const roommateSchema = new Schema({
    author: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    city: {
        type: String,
        required: true,
        trim: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    myGender: {
        type: String,
        enum: ["Male", "Female", "Other", "Prefer not to say"],
        required: true
    },
    prefGender: {
        type: String,
        enum: ["Male", "Female", "Any"],
        required: true
    },
    budget: {
        type: Number,
        required: true,
        min: 0
    },
    bio: {
        type: String,
        required: true,
        maxLength: 500
    },
    noSmoking: {
        type: Boolean,
        default: false
    },
    quietHours: {
        type: Boolean,
        default: false
    },
    cleanDuties: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ["waiting", "matched", "expired"],
        default: "waiting"
    },
    isEmergencyTriggered: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Roommate", roommateSchema);
