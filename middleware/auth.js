const jwt = require("jsonwebtoken");
const config = require("config");

// middleware function - has access to the request and response objects
// send token back to authenticate and be able to access the protected routes
// verify the JSON web token, that comes in from client to auth our users

module.exports = function (req, res, next) {
  // get token from header

  const token = req.header("x-auth-token");

  // check if no token
  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  // verify token

  try {
    // decode the token using jwt.verify

    const decoded = jwt.verify(token, config.get("jwtSecret"));

    // take request object and assign a value to user
    // set req.user equal to the decoded value which has user in the payload
    // then can use our req.user in any of our protected routes to e.g get user's profile

    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: "Token is not valid" });
  }
};
// now can put this in one of our routes
