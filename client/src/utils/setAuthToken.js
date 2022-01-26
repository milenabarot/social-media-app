import axios from "axios";

// check to see if there is a token, if there is then put it into a global header
// so we can send the token with every request

const setAuthToken = (token) => {
  if (token) {
    axios.defaults.headers.common["x-auth-token"] = token;
  } else {
    delete axios.defaults.headers.common["x-auth-token"];
  }
};

export default setAuthToken;
