const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const plugin = passportLocalMongoose.default || passportLocalMongoose;

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
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