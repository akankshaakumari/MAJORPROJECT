const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const travelEventSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    date: { type: Date, required: true },
    image: {
      filename: String,
      url: {
          type: String,
          default: "https://unsplash.com/photos/group-of-people-walking-on-street-during-daytime-Vow42wK4Pik"
      }
    },
    organizer: { type: Schema.Types.ObjectId, ref: "User" },
    attendees: [{ type: Schema.Types.ObjectId, ref: "User" }],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("TravelEvent", travelEventSchema);
