import { REMOVE_ALERT, SET_ALERT } from "./types";
import { v4 as uuidv4 } from "uuid";

// ACTION -- APP INTERACTS WITH STORE VIA THE REDUCER. ACTIONS SENT VIA THE DISPATCH METHOD
// Actions are plain objects with a type field, and describe "what happened" in the app
// Reducers are functions that calculate a new state value based on previous state + an action
// A Redux store runs the root reducer whenever an action is dispatched

export const setAlert = (msg, alertType) => (dispatch) => {
  // use the uuid package to generate a random id
  const id = uuidv4();
  dispatch({
    type: SET_ALERT,
    payload: { msg, alertType, id },
  });

  setTimeout(() => dispatch({ type: REMOVE_ALERT, payload: id }), 5000);
};
