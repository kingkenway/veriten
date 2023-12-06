const express = require("express");
const router = express.Router();
const PropertiesController = require("../controllers/propertiesController");
const { isLoggedIn } = require("../middleware/authMiddleware"); // Import the isLoggedIn middleware

// Display the list of properties (home page)
router.get("/", PropertiesController.showProperties);

// Display the form to add a new property
router.get("/add", isLoggedIn, PropertiesController.showAddPropertyForm);

// Handle adding a new property
router.post("/add", isLoggedIn, PropertiesController.addProperty);

// Display details of a specific property
router.get("/:id", PropertiesController.showPropertyDetails);

module.exports = router;
