const express = require("express");
const router = express.Router();
const AdminController = require("../controllers/adminController");
const { isLoggedIn, isAdmin } = require("../middleware/authMiddleware"); // Import the isLoggedIn middleware

// Display the admin dashboard
router.get("/dashboard", isLoggedIn, isAdmin, AdminController.showDashboard);

// Manage users
router.get("/manage-users", isLoggedIn, isAdmin, AdminController.manageUsers);

// Review properties
router.get(
  "/review-properties",
  isLoggedIn,
  isAdmin,
  AdminController.reviewProperties
);

router.get(
  "/manage-users/delete/:id",
  isLoggedIn,
  isAdmin,
  AdminController.deleteUser
);
router.post(
  "/approve-property/approve/:id",
  isLoggedIn,
  isAdmin,
  AdminController.approveProperty
);
router.post(
  "/delete-property/delete/:id",
  isLoggedIn,
  isAdmin,
  AdminController.deleteProperty
);
// router.post("/approve-property/:propertyId", AdminController.approveProperty);

module.exports = router;
