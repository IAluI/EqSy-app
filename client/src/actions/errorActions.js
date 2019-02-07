/**
 * Action creators компонента отображающего сообщение об ошибке.
 *
 * @module src/actions/errorActions
 */

"use strict";

import { SET_ERROR, UN_SET_ERROR } from "../actions/actionTypes";

export function setError(errorText) {
  return {
    type: SET_ERROR,
    payload: errorText
  };
}

export function unSetError() {
  return {
    type: UN_SET_ERROR
  };
}
