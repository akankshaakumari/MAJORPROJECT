const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const plugin = passportLocalMongoose.default || passportLocalMongoose;

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  }
});

userSchema.plugin(plugin);

module.exports = mongoose.model("User", userSchema);