const express = require("express");
const router = express.Router();
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const { check, validationResult } = require("express-validator");

// bring in User Model
const User = require("../../models/User");

// @route   POST api/users
// @desc    Register user
// @access  Public

router.post(
  "/",
  [
    check("name", "Name is required").notEmpty(),
    check("email", "Please include a valid email address").isEmail(),
    check(
      "password",
      "Please enter a password with 6 or more characters"
    ).isLength({ min: 6 }),
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
    const { name, email, password } = req.body;

    try {
      // see if user exists
      let user = await User.findOne({ email: req.body.email });

      // if user does already exist then send back error msg
      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "User already exists" }] });
      }

      // If a user has not been found with the above email then get users gravatar
      const avatar = gravatar.url(email, { s: "200", r: "pg", d: "mm" });
      // create new user using destructuring
      user = new User({
        name,
        email,
        avatar,
        password,
      });
      //Encrypt password, pass in 10 into salt
      const salt = await bcrypt.genSalt(10);
      // take user object, and password key and take in the password and salt to create a hash,
      // which sets it equal to user.password
      user.password = await bcrypt.hash(password, salt);

      // anything that returns a promise need to use await with it
      await user.save();

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
