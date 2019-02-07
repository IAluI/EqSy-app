/**
 * Action creators для компонента отображающего страницу логина.
 *
 * @module src/actions/loginActions
 */

"use strict";

import { LOGIN_SUCCESS, SET_INITIAL_STATE } from "../actions/actionTypes";
import { SITE_URL } from "../constants";

import { setError } from "../actions/errorActions";
import { initForm } from "../actions/dataBaseActions";
import { progressStart, progressStop } from "../actions/progressActions";

export function signIn(userName, userPass, history) {
  return dispatch => {
    dispatch(progressStart());
    fetch(SITE_URL + "api/signin", {
      method: "POST",
      body: JSON.stringify({
        userName,
        userPass
      }),
      headers: {
        "Content-Type": "application/json"
      }
    })
      .then(response => {
        if (!response.ok) {
          return response.text();
        }
        return response.json();
      })
      .then(res => {
        if (typeof res === "string") {
          throw res;
        }
        dispatch(loginSucess({
          userName: userName,
          token: res.password,
          editAllow: res.editAllow
        }));
        dispatch(initForm(res.atrList));
        dispatch(progressStop());
        history.push("/app/db/search");
      })
      .catch(err => {
        dispatch(progressStop());
        dispatch(setError(err));
      });
  };
}

function loginSucess(payload) {
  return {
    type: LOGIN_SUCCESS,
    payload
  };
}

export function setInitialState() {
  return {
    type: SET_INITIAL_STATE
  };
}
