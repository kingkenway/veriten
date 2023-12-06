// routes/index.js
const express = require("express");
const router = express.Router();
const Property = require("../models/property");

router.get("/", async (req, res) => {
  try {
    // Fetch properties from the database (you might need to adjust this based on your actual data fetching logic)
    const properties = await Property.find();

    // Render the home view and pass the properties variable
    res.render("home", { properties, user: req.session?.user?.username });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
