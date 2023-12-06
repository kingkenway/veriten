const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: String,
  fullname: String,
  email: String,
  password: String,
  userType: { type: String, enum: ["individual", "business"] },
  bvn: {
    type: String,
    default: "",
  },
  isBvnVerified: {
    type: Boolean,
    default: false,
  },
  kycDocument: {
    type: {
      type: String,
      default: "",
    },
    number: {
      type: String,
      default: "",
    },
    url: {
      type: String,
      default: "https://travelotus.com/wp-content/uploads/2019/02/passport.jpg",
    },
  },
  businessDocument: {
    businessName: {
      type: String,
      default: "",
    },
    reNumber: {
      type: String,
      default: "",
    },
    url: {
      type: String,
      default: "https://travelotus.com/wp-content/uploads/2019/02/passport.jpg",
    },
  },
  isVerified: { type: Boolean, default: false },
  isAdmin: { type: Boolean, default: false }, // Added isAdmin field
});

module.exports = mongoose.model("User", userSchema);
