const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reportSchema = new Schema({
    reportedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    reportedUser: { type: Schema.Types.ObjectId, ref: "User" },
    reportedListing: { type: Schema.Types.ObjectId, ref: "Listing" },
    reason: { type: String, required: true },
    description: String,
    status: { type: String, enum: ["pending", "investigating", "resolved", "dismissed"], default: "pending" },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Report", reportSchema);
