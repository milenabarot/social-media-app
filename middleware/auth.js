const jwt = require("jsonwebtoken");
const config = require("config");

// middleware function

module.exports = function (req, res, next) {
  // get token from header

  const token = req.header("x-auth-token");

  // check if no token
  if (!token) {
    return res.status(401).json({ msg: "No token, authorisation denied" });
  }

  // verify token
  try {
    const decoded = jwt.verify(token, config.get("jwtSecret"));
    // set req.user equal to the user in the decoded version
    // then can use our req.user in any of our protected routes to e.g get user's profile
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: "Token is not valid" });
  }
};
