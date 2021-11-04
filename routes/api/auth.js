const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const User = require("../../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const { check, validationResult } = require("express-validator");

// @route   GET api/auth
// @desc    Test route
// @access  Public

// Using Middleware
// added auth as a 2nd parameter to use middleware - this will make the route protected
router.get("/", auth, async (req, res) => {
  try {
    // bring in the user model and find a user based on id
    // as this is a protected route and we are using the token,
    // in middleware we set the req.user to the user in the token, so can pass req.user - can access it from anywhere in a protected route
    // don't want to return the password, so we minus string of password
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Validating a user - a login

// @route   POST api/auth
// @desc    Authenticate user and get token
// @access  Public

router.post(
  "/",
  [
    check("email", "Please include a valid email address").isEmail(),
    check("password", "Password is required").exists(),
  ],

  async (req, res) => {
    console.log(req.body);
    // validation result takes in req to check for errors
    // if are errors, will be displayed in array
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    //destructor for req.body
    const { email, password } = req.body;

    try {
      // see if user exists
      let user = await User.findOne({ email: req.body.email });

      // if user does not exist then send back error msg
      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Invalid Credentials" }] });
      }

      // match email and password after the user has been found

      // bcrypt takes passwords and see if they match
      // take in 1st password which user types in, and encrypted password which we get from user from database

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Invalid Credentials" }] });
      }

      // Return jsonwebtoken
      // payload is data you want to send in token - use id
      const payload = {
        user: {
          id: user.id,
        },
      };

      // 1st 2 parameters are the payload and jwtSecret.
      // callback takes in the error and the token itself
      // token gets sent back to client if no error

      jwt.sign(
        payload,
        config.get("jwtSecret"),
        { expiresIn: 36000 },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);

module.exports = router;
