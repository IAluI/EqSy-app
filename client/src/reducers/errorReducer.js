/**
 * Reducer обслуживающий компонент отображающий сообщение об ошибке.
 *
 * @module src/reducers/errorReducer
 */

"use strict";

import { SET_ERROR, UN_SET_ERROR, SET_INITIAL_STATE } from "../actions/actionTypes";

const initialState = {
  errorText: ""
};

export default function(state = initialState, action) {
  switch (action.type) {
    case SET_ERROR:
      return { errorText: action.payload };
    case UN_SET_ERROR:
      return initialState;
    case SET_INITIAL_STATE:
      return initialState;
    default:
      return state;
  }
}