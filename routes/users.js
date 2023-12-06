const express = require("express");
const router = express.Router();
const UserController = require("../controllers/userController");
const { isLoggedIn } = require("../middleware/authMiddleware"); // Import the isLoggedIn middleware

// Display registration form
router.get("/register", UserController.showRegistrationForm);

// Handle user registration
router.post("/register", UserController.registerUser);

// Display KYC submission form
router.get("/submit-kyc", isLoggedIn, UserController.showKYCForm);

// Handle KYC submission
router.post("/submit-kyc", UserController.submitKYC);

// Display KYC submission form
router.get("/submit-bvn", isLoggedIn, UserController.showBVNForm);

// Handle KYC submission
router.post("/submit-bvn", UserController.submitBVN);

// Display verification status
router.get(
  "/verification-status",
  isLoggedIn,
  UserController.showVerificationStatus
);

// Logout route
router.get("/logout", (req, res) => {
  // Destroy the user's session to log them out
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
      res.status(500).send("Internal Server Error");
    } else {
      // Redirect to the home page or any other desired page after logout
      res.redirect("/");
    }
  });
});

router.get("/login", UserController.showLoginForm);
router.post("/login", UserController.loginUser);

module.exports = router;
