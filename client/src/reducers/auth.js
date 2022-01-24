import { REGISTER_SUCCESS, REGISTER_FAIL } from "../actions/types";

//REDUCER

const initalState = {
  token: localStorage.getItem("token"),
  isAuthenticated: null,
  loading: null,
  user: null,
};

export default function (state = initalState, action) {
  const { type, payload } = action;

  switch (type) {
    case REGISTER_SUCCESS:
      localStorage.setItem("token", payload.token);
      return {
        ...state,
        ...payload,
        isAuthenticated: true,
        loading: false,
      };
    case REGISTER_FAIL:
      localStorage.removeItem("token");
      return {
        ...state,
        isAuthenticated: false,
        loading: false,
      };
    default:
      return state;
  }
}
