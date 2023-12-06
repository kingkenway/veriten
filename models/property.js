// models/property.js
const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema({
  title: String,
  description: String,
  price: Number,
  image: String,
  isOwner: {
    type: Boolean,
    default: false,
  },
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  isApproved: { type: Boolean, default: false },
});

module.exports = mongoose.model("Property", propertySchema);
