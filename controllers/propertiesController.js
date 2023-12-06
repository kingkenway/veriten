const Property = require("../models/property");

const PropertiesController = {
  showProperties: async (req, res) => {
    try {
      // Fetch all properties from the database
      const properties = await Property.find();

      // Render the home page with the list of properties
      res.render("home", { properties });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },

  showAddPropertyForm: (req, res) => {
    const errorMessage = req.session.errorMessage;

    if (!req.session.user.isBvnVerified) {
      return res.render("users/bvn-submission", {
        errorMessage: errorMessage,
      });
    } else if (!req.session.user.isVerified) {
      return res.render("users/kyc-submission", {
        errorMessage: errorMessage,
      });
    }

    res.render("properties/add-property", { errorMessage });
  },

  addProperty: async (req, res) => {
    try {
      const { title, description, image, price, houseOwnership } = req.body;
      if (!title || !description || !image || !price || !houseOwnership) {
        return res.status(400).send("All fields are required");
      }

      if (houseOwnership === "no") {
        // Create a new property
        const newProperty = new Property({
          title,
          description,
          image,
          price,
          isOwner: false,
          submittedBy: req.session.user._id,
        });
        await newProperty.save();
        res.redirect("/properties");
      } else {
        try {
          const options = {
            method: "POST",
            headers: {
              accept: "application/json",
              "mono-sec-key": process.env.MONO_SECRET_KEY,
              "content-type": "application/json",
            },
            body: JSON.stringify({
              meter_number: req.body.meter_number,
              address: req.body.address,
            }),
          };

          fetch(`https://api.withmono.com/v3/lookup/address`, options)
            .then(async (response) => {
              if (!response.ok) {
                const errorResponseData = await response.json(); // Parse error response JSON if available
                throw new Error(JSON.stringify(errorResponseData)); // Throw the error response as an error message
              }
              return response.json();
            })
            .then(async (responseData) => {
              console.log(responseData);

              if (responseData.data.verified) {
                const newProperty = new Property({
                  title,
                  description,
                  image,
                  price,
                  isOwner: true,
                  submittedBy: req.session.user._id,
                });
                await newProperty.save();
                res.redirect("/");
              }
            })
            .catch((error) => {
              let errorMessage = "An error occurred";
              try {
                errorMessage = JSON.parse(error.message); // Attempt to parse the error message as JSON
              } catch (parseError) {
                // JSON parsing failed, use the default error message
              }
              return res.render("properties/add-property", {
                errorMessage: errorMessage.message,
              });
            });
        } catch (error) {}
      }
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },

  showPropertyDetails: async (req, res) => {
    try {
      // Fetch the property details from the database based on the provided property ID
      const property = await Property.findById(req.params.id).populate(
        "submittedBy"
      );

      if (!property) {
        return res.status(404).send("Property not found");
      }

      // Render the property details page
      res.render("properties/property-details", { property });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },
};

module.exports = PropertiesController;
