/**
 * Reducer обслуживающий компонент отображающий, что приложение занято какой-либо задачей.
 *
 * @module src/reducers/progressReducer
 */

"use strict";

import { PROGRESS_START, PROGRESS_STOP, SET_INITIAL_STATE } from "../actions/actionTypes";

const initialState = {
  inProgress: false
};

export default function(state = initialState, action) {
  switch (action.type) {
    case PROGRESS_START:
      return { inProgress: true };
    case PROGRESS_STOP:
      return { inProgress: false };
    case SET_INITIAL_STATE:
      return initialState;
    default:
      return state;
  }
}
