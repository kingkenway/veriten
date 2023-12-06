// Import necessary modules
const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");

// Load environment variables from .env file
dotenv.config();

// Create an Express application
const app = express();

// Set up MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Express session middleware setup
app.use(
  session({
    secret: process.env.MONO_SESSION_KEY,
    resave: false,
    saveUninitialized: true,
    store: new MongoStore({ mongooseConnection: mongoose.connection }), // Use the existing MongoDB connection
    cookie: { maxAge: 1000 * 60 * 60 * 24 }, // 1 day
  })
);

// Middleware
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Middleware to set user object
app.use((req, res, next) => {
  res.locals.user = req.session.user;
  res.locals.errorMessage = req.session.errorMessage;
  next();
});

// Routes
app.use("/", require("./routes/index"));
app.use("/users", require("./routes/users"));
app.use("/admin", require("./routes/admin"));
app.use("/properties", require("./routes/properties"));

// ... (existing code)

// Routes
app.use("/", require("./routes/index"));
app.use("/users", require("./routes/users"));
app.use("/admin", require("./routes/admin"));
app.use("/properties", require("./routes/properties"));

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
