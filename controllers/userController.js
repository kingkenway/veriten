const User = require("../models/user");
const bcrypt = require("bcrypt");
const fetch = require("node-fetch");

const imageUrl =
  "https://travelotus.com/wp-content/uploads/2019/02/passport.jpg";

function processKycDocument(kycDocument) {
  let result = {};

  if (kycDocument.nin) {
    return kycDocument.nin;
  } else if (kycDocument.license_number) {
    return kycDocument.license_number;
  } else if (kycDocument.passport_number) {
    return kycDocument.passport_number;
  }

  return result;
}

function searchByRcNumber(searchData, rcNumber) {
  const foundCompany = searchData.find(
    (company) => company.rcNumber === rcNumber
  );

  if (foundCompany) {
    return foundCompany;
  } else {
    return false;
  }
}

function extractNameFromEmail(email) {
  // Split the email address into two parts: the name and the domain
  const [name, domain] = email.split("@");

  // Return the extracted name
  return name;
}

function reverseDateString(dateString) {
  // Split the date string into year, month, and day
  const [year, month, day] = dateString.split("-");

  // Concatenate the parts in reverse order with dashes
  const reversedDateString = `${day}-${month}-${year}`;

  return reversedDateString;
}

function removeProperties(obj) {
  // Destructure the object to create a new one without the specified properties
  const { documentType, documentImage, ...newObj } = obj;
  return newObj;
}

const UserController = {
  showRegistrationForm: (req, res) => {
    const errorMessage = req.session.errorMessage; // Adjust this based on how you store and retrieve error messages

    // Render the registration page with the errorMessage variable
    res.render("users/registration", { errorMessage });
  },

  registerUser: async (req, res) => {
    const errorMessage = req.session.errorMessage;

    try {
      const { username, email, password, userType } = req.body;

      // Check if email is already in use
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        const errorMessage =
          "Email is already in use. Please choose another email.";
        return res.render("users/registration", { errorMessage });
      }

      // Check minimum password length
      if (password.length < 5) {
        const errorMessage = "Password must be at least 5 characters long.";
        return res.render("users/registration", { errorMessage });
      }

      // Hash the password before saving it to the database
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create a new user with the hashed password
      const newUser = new User({
        username: extractNameFromEmail(email),
        email,
        password: hashedPassword,
        userType,
      });

      await newUser.save();

      // Set the userId in the session after successful registration
      req.session.user = newUser;

      // Redirect or respond as needed
      // res.redirect("/users/submit-bvn");
      res.render("users/bvn-submission", {
        user: req.session.newUser,
        errorMessage,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },

  showKYCForm: (req, res) => {
    const errorMessage = req.session.errorMessage;

    res.render("users/kyc-submission", {
      // user: req.session.user,
      errorMessage,
    });
  },

  showBVNForm: (req, res) => {
    const errorMessage = req.session.errorMessage;

    res.render("users/bvn-submission", {
      user: req.session.user,
      errorMessage,
    });
  },

  submitKYC: async (req, res) => {
    const kycDocument = req.body;
    const kycIdentityValues = removeProperties(req.body);
    // const identityUrlPath = {
    //   nin: "/nin",
    //   passport: "/passport",
    //   drivers_license: "/driver_license",
    // };

    console.log(kycDocument);

    if (kycDocument.documentType === "lookup") {
      try {
        const options = {
          method: "GET",
          headers: {
            accept: "application/json",
            "mono-sec-key": process.env.MONO_SECRET_KEY,
            "content-type": "application/json",
          },
        };

        fetch(
          `https://api.withmono.com/v1/cac/lookup?name=${kycDocument.rcNumber}`,
          options
        )
          .then(async (response) => {
            if (!response.ok) {
              const errorResponseData = await response.json(); // Parse error response JSON if available
              throw new Error(JSON.stringify(errorResponseData)); // Throw the error response as an error message
            }
            return response.json();
          })
          .then(async (responseData) => {
            console.log(responseData);

            if (
              responseData.data[0]["approvedName"] !== kycDocument.businessName
            ) {
              return res.render("users/kyc-submission", {
                errorMessage:
                  "The match between the business name and RC Number is invalid.",
              });
            } else {
              await User.findByIdAndUpdate(req.session.user._id, {
                businessDocument: {
                  businessName: kycDocument.businessName,
                  rcNumber: kycDocument.rcNumber,
                  url: imageUrl,
                },
                isVerified: true,
              });
              console.log(responseData);
              req.session.user.isVerified = true;
              res.redirect("/users/verification-status"); // Redirect to verification status page
            }
          })
          .catch((error) => {
            let errorMessage = "An error occurred";
            try {
              errorMessage = JSON.parse(error.message); // Attempt to parse the error message as JSON
            } catch (parseError) {
              // JSON parsing failed, use the default error message
            }
            return res.render("users/kyc-submission", {
              errorMessage: errorMessage.message,
            });
          });
      } catch (error) {}
    } else {
      try {
        const options = {
          method: "POST",
          headers: {
            accept: "application/json",
            "mono-sec-key": process.env.MONO_SECRET_KEY,
            "content-type": "application/json",
          },
          body: JSON.stringify({ ...kycIdentityValues }),
        };

        fetch(
          `https://api.withmono.com/v3/lookup/${kycDocument.documentType}`,
          options
        )
          .then(async (response) => {
            if (!response.ok) {
              const errorResponseData = await response.json(); // Parse error response JSON if available
              throw new Error(JSON.stringify(errorResponseData)); // Throw the error response as an error message
            }
            return response.json();
          })
          .then(async (responseData) => {
            await User.findByIdAndUpdate(req.session.user._id, {
              kycDocument: {
                type: kycDocument.documentType,
                number: processKycDocument(kycDocument),
                url: imageUrl,
              },
              isVerified: true,
            });
            console.log(responseData);
            req.session.user.isVerified = true;
            res.redirect("/users/verification-status"); // Redirect to verification status page
          })
          .catch((error) => {
            let errorMessage = "An error occurred";
            try {
              errorMessage = JSON.parse(error.message); // Attempt to parse the error message as JSON
            } catch (parseError) {
              // JSON parsing failed, use the default error message
            }
            return res.render("users/kyc-submission", {
              errorMessage: errorMessage.message,
            });
          });
      } catch (error) {}
    }
  },

  submitBVN: async (req, res) => {
    try {
      const bvnDocument = req.body;
      console.log(bvnDocument);

      try {
        const options = {
          method: "POST",
          headers: {
            accept: "application/json",
            "mono-sec-key": process.env.MONO_SECRET_KEY,
            "content-type": "application/json",
          },
          body: JSON.stringify({
            bvn: bvnDocument.documentNumber,
          }),
        };

        fetch("https://api.withmono.com/v2/lookup/bvn", options)
          .then(async (response) => {
            if (!response.ok) {
              const errorResponseData = await response.json(); // Parse error response JSON if available
              throw new Error(JSON.stringify(errorResponseData)); // Throw the error response as an error message
            }
            return response.json();
          })
          .then(async (responseData) => {
            // res.render("redirect", { externalUrl: responseData.payment_link });

            console.log(responseData.data.dob);
            console.log(typeof responseData.data.dob);

            if (reverseDateString(bvnDocument.dob) !== responseData.data.dob) {
              return res.render("users/bvn-submission", {
                errorMessage:
                  "The provided date of birth does not align with the registered information in the BVN database.",
              });
            } else {
              await User.findByIdAndUpdate(req.session.user._id, {
                bvn: bvnDocument.documentNumber,
                isBvnVerified: true,
              });
              req.session.user.isBvnVerified = true;

              res.redirect("/users/submit-kyc"); // Redirect to verification status page
            }
          })
          .catch((error) => {
            let errorMessage = "An error occurred";
            try {
              errorMessage = JSON.parse(error.message); // Attempt to parse the error message as JSON
            } catch (parseError) {
              // JSON parsing failed, use the default error message
            }
            return res.render("users/bvn-submission", {
              errorMessage: errorMessage.message,
            });
          });
      } catch (error) {}

      // Update the user's KYC document
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },

  showVerificationStatus: (req, res) => {
    res.render("users/verification-status", {
      isVerified: req.session.user.isVerified,
    });
  },

  showLoginForm: (req, res) => {
    const errorMessage = req.session.errorMessage; // Adjust this based on how you store and retrieve error messages

    res.render("users/login", { errorMessage });
  },

  loginUser: async (req, res) => {
    const errorMessage = req.session.errorMessage; // Adjust this based on how you store and retrieve error messages

    try {
      const { email, password } = req.body;

      // Find the user by email
      const user = await User.findOne({ email });

      // Check if the user exists
      if (!user) {
        const errorMessage = "Incorrect email or password.";
        return res.render("users/login", { errorMessage });
      }

      // Compare the entered password with the hashed password
      const passwordMatch = await bcrypt.compare(password, user.password);

      // Check if the password is correct
      if (!passwordMatch) {
        const errorMessage = "Incorrect email or password.";
        return res.render("users/login", { errorMessage });
      }

      // Set the userId in the session after successful login
      req.session.user = user;

      // Redirect or respond as needed
      //   res.redirect("/");

      // console.log(req.session.user);
      // console.log(req);

      if (!req.session.user.isBvnVerified) {
        return res.render("users/bvn-submission", {
          errorMessage: errorMessage,
        });
      } else if (!req.session.user.isVerified) {
        return res.render("users/kyc-submission", {
          errorMessage: errorMessage,
        });
      } else {
        res.redirect("/");
      }
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },
};

module.exports = UserController;

// BVN
// NIN
// Int'l Passport
// TIN
// Driver License

// Upload
// <% if (user.userType == "individual") { %> <% { %>
//
