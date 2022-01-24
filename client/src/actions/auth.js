import axios from "axios";
import { setAlert } from "./alert";
import { REGISTER_SUCCESS, REGISTER_FAIL } from "./types";

//ACTION
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
