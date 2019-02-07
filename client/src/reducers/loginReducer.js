/**
 * Reducer обслуживающий компонент отвечающий за страницу логина.
 *
 * @module src/reducers/login
 */

"use strict";

import { LOGIN_SUCCESS, SET_INITIAL_STATE } from "../actions/actionTypes";

const initialState = {
  userName: "",
  token: "",
  editAllow: false
};

export default function(state = initialState, action) {
  switch (action.type) {
    case LOGIN_SUCCESS:
      return { ...action.payload };
    case SET_INITIAL_STATE:
      return initialState;
    default:
      return state;
  }
}