const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const messageSchema = new Schema({
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    recipient: { type: Schema.Types.ObjectId, ref: "User" }, // For DM
    tripId: { type: Schema.Types.ObjectId, ref: "Trip" }, // For Group Chat
    listingId: { type: Schema.Types.ObjectId, ref: "Listing" }, // Context for host-guest chat
    content: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Message", messageSchema);
