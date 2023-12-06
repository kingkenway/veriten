// middlewares/authMiddleware.js
const isLoggedIn = (req, res, next) => {
  const errorMessage = req.session.errorMessage;
  console.log(req.session.user?._id);
  // Check if the user is logged in
  if (req.session.user?._id) {
    // User is logged in, proceed to the next middleware or route handler

    // console.log(req.session.user);
    // console.log(req);

    // if (!req.session.user.isBvnVerified) {
    //   return res.render("users/bvn-submission", {
    //     errorMessage: errorMessage,
    //   });
    // } else if (!req.session.user.isVerified) {
    //   return res.render("users/kyc-submission", {
    //     errorMessage: errorMessage,
    //   });
    // } else {
    //   next();
    // }
    next();
  } else {
    // User is not logged in, redirect to login page
    res.redirect("/users/login");
  }
};

// middlewares/authMiddleware.js
const isAdmin = (req, res, next) => {
  // Check if the user is logged in

  if (req.session.user?._id) {
    // Check if the user is an admin (you need to have a way to determine this, e.g., a userType field in the User model)
    const isAdminUser = req.session.user.isAdmin; // Adjust this based on how you store admin status

    if (isAdminUser) {
      // User is an admin, proceed to the next middleware or route handler
      next();
    } else {
      // User is not an admin, redirect to unauthorized page or handle as needed
      res.redirect("/"); // Adjust the route to your unauthorized page
    }
  } else {
    // User is not logged in, redirect to login page
    res.redirect("/users/login");
  }
};

module.exports = { isLoggedIn, isAdmin };
