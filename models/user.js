const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const plugin = passportLocalMongoose.default || passportLocalMongoose;

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ["user", "host", "admin"],
    default: "user"
  },
  isBlocked: {
    type: Boolean,
    default: false
  },
  profile: {
    name: String,
    phone: String,
    isPhoneVerified: {
      type: Boolean,
      default: false
    },
    idProof: {
      filename: String,
      url: String
    },
    travelPreferences: {
      type: [String],
      default: ["Adventure", "Luxury", "Budget"]
    },
    profileImage: {
      filename: String,
      url: String
    },
    verificationStatus: {
      type: String,
      enum: ["unverified", "pending", "verified", "rejected"],
      default: "unverified"
    }
  },
  isTravelerVerified: {
    type: Boolean,
    default: false
  },
  wishlist: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing"
    }
  ]
});

userSchema.plugin(plugin);

module.exports = mongoose.model("User", userSchema);