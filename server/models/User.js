const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  userName: String,
  userEmail: String,
  password: String,
  role: String,
  dob: Date,
  guardianDetails: String,
});

module.exports = mongoose.model("User", UserSchema);
