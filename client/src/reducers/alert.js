import { SET_ALERT, REMOVE_ALERT } from "../actions/types";
const initalState = [];

export default function (state = initalState, action) {
  // action contains the type and the payload which is the data
  // type is what we will evaluate
  // use variables for types
  switch (action.type) {
    case SET_ALERT:
      return [...state, action.payload];
    case REMOVE_ALERT:
      // return all the alerts except the one that matches the payload
      return state.filter((alert) => alert.id !== action.payload);
    default:
      return state;
  }
}
