const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const User = require("../../models/User");

// @route   GET api/auth
// @desc    Test route
// @access  Public
// added auth as a 2nd parameter to use middleware
router.get("/", auth, async (req, res) => {
  try {
    // bring in the user model and find a user based on id
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
