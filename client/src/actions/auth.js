import axios from "axios";
import setAuthToken from "../utils/setAuthToken";
import { setAlert } from "./alert";
import {
  REGISTER_SUCCESS,
  REGISTER_FAIL,
  USER_LOADED,
  AUTH_ERROR,
  LOGIN_SUCCESS,
  LOGIN_FAIL,
} from "./types";

//ACTION

// LOAD USER

// check to see if there is a token, if there is then put it into a global header
// do this in setAuthToken file
export const loadUser = () => async (dispatch) => {
  if (localStorage.token) {
    setAuthToken(localStorage.token);
  }

  try {
    const res = await axios.get("/api/auth");

    // send the payload which will be the user, to the action type USER_LOADED action type
    dispatch({
      type: USER_LOADED,
      payload: res.data,
    });
  } catch (err) {
    dispatch({
      type: AUTH_ERROR,
    });
  }
};

//REGISTER A USER

export const register =
  ({ name, email, password }) =>
  async (dispatch) => {
    // don't need a config object for axios as default types are already set correctly
    // axios stringifies JSON for us, so no need to do that too

    // const body = JSON.stringify({ name, email, password })

    try {
      const res = await axios.post("/api/users", { name, email, password });
      console.log(res);
      dispatch({
        type: REGISTER_SUCCESS,
        payload: res.data,
      });

      dispatch(loadUser());
    } catch (err) {
      const errors = err.response.data.errors;

      if (errors) {
        errors.forEach((error) => dispatch(setAlert(error.msg, "danger")));
      }

      dispatch({
        type: REGISTER_FAIL,
        // don't need a payload here, as we aren't doing anything else with the state
      });
    }
  };

//LOGIN USER

export const login = (email, password) => async (dispatch) => {
  // don't need a config object for axios as default types are already set correctly
  // axios stringifies JSON for us, so no need to do that too

  // const body = JSON.stringify({ name, email, password })

  try {
    const res = await axios.post("/api/auth", { email, password });
    console.log(res);
    dispatch({
      type: LOGIN_SUCCESS,
      payload: res.data,
    });

    dispatch(loadUser());
  } catch (err) {
    const errors = err.response.data.errors;

    if (errors) {
      errors.forEach((error) => dispatch(setAlert(error.msg, "danger")));
    }

    dispatch({
      type: LOGIN_FAIL,
      // don't need a payload here, as we aren't doing anything else with the state
    });
  }
};
