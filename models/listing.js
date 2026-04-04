const mongoose = require("mongoose");
const Review = require("./review");
const Schema = mongoose.Schema;

// const listingSchema = new Schema({
//   title: {
//     type: String,
//     required: true,
//   },

//   description: String,

//   image: {
//     type: String,
//     default: "https://unsplash.com/photos/palm-tree-silhouette-against-a-vibrant-sunset-over-the-ocean-fNCdkeXc5YE",
//     set: (v) =>
//       v === ""
//         ? "https://unsplash.com/photos/palm-tree-silhouette-against-a-vibrant-sunset-over-the-ocean-fNCdkeXc5YE"
//         : v,
//   },

//   price: Number,
//   location: String,
//   country: String,
// });
const listingSchema = new Schema({
  title: { type: String, required: true },
  description: String,
  image: {
    filename: String,
    url: {
      type: String,
      default: "https://unsplash.com/photos/palm-tree-silhouette-against-a-vibrant-sunset-over-the-ocean-fNCdkeXc5YE"
    }
  },
  price: Number,
  location: String,
  country: String,
  geometry: {
    type: {
      type: String,
      enum: ['Point']
    },
    coordinates: {
      type: [Number]
    }
  },
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review"

    }
  ],
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  category: {
    type: String,
    enum: ["Trending", "Rooms", "Iconic Cities", "Mountains", "Castles", "Amazing Pools", "Camping", "Farms", "Arctic", "Domes", "Boats"]
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  },
  amenities: {
    type: [String],
    default: ["Wi-Fi", "Kitchen", "Air Conditioning"]
  },
  houseRules: {
    type: [String],
    default: ["No Smoking", "Pets Allowed", "Party-Friendly"]
  },
  specialPricing: {
    weekendPrice: { type: Number, default: 0 },
    festivalPrice: { type: Number, default: 0 },
    longStayDiscount: { type: Number, default: 10 } // percent
  },
  pricingCalendar: [{
    date: Date,
    price: Number,
    note: String
  }]
});


listingSchema.post("findOneAndDelete", async (listing) => {
  if (listing) {
    await Review.deleteMany({ _id: { $in: listing.reviews } });
  }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
