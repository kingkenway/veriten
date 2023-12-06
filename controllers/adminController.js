const User = require("../models/user");
const Property = require("../models/property");

const AdminController = {
  showDashboard: async (req, res) => {
    try {
      // Fetch admin-specific statistics (total users and total properties)
      const totalUsers = await User.countDocuments();
      const totalProperties = await Property.countDocuments();

      // Render the admin dashboard with the statistics
      res.render("admin/admin-dashboard", { totalUsers, totalProperties });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },

  manageUsers: async (req, res) => {
    try {
      // Fetch and display a list of users
      const users = await User.find();
      res.render("admin/manage-users", { users });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },

  deleteUser: async (req, res) => {
    try {
      // Delete a user based on the provided user ID
      await User.findByIdAndDelete(req.params.id);
      res.redirect("/admin/manage-users"); // Redirect back to the manage users page
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },

  reviewProperties: async (req, res) => {
    try {
      // Fetch and display a list of properties pending review
      const properties = await Property.find({ isApproved: false });
      res.render("admin/review-properties", { properties });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },

  reviewProperties: async (req, res) => {
    try {
      // Retrieve properties from the database
      const properties = await Property.find({ isApproved: false });

      res.render("admin/review-properties", { properties });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },

  approveProperty: async (req, res) => {
    try {
      // Approve a property based on the provided property ID
      await Property.findByIdAndUpdate(req.params.id, { isApproved: true });
      res.redirect("/admin/review-properties"); // Redirect back to the review properties page
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },

  deleteProperty: async (req, res) => {
    try {
      // Delete a property based on the provided property ID
      await Property.findByIdAndDelete(req.params.id);
      res.redirect("/admin/review-properties"); // Redirect back to the review properties page
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },
};

module.exports = AdminController;
