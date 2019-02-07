/**
 * Action creators для компонентов отображающих страницы поиска и результата запроса к БД.
 *
 * @module src/actions/dataBaseActions
 */

"use strict";

import { INIT_FORM, UPDATE_FORM, SAVE_DATA, CHANGE_PAGE, SORT_DATA, UPDATE_STATE } from "../actions/actionTypes";
import { SITE_URL } from "../constants";

import { setError } from "./errorActions";
import { progressStart, progressStop } from "../actions/progressActions";

export function initForm(atrList) {
  return {
    type: INIT_FORM,
    payload: atrList
  };
}

export function updateForm(formData) {
  return {
    type: UPDATE_FORM,
    payload: formData
  };
}

export function getData(inputData, history) {
  return dispatch => {
    if (!Object.keys(inputData.query).length) {
      dispatch(setError("Необходимо выбрать хотя бы один атрибут"));
      return null;
    }
    dispatch(progressStart());
    fetch(SITE_URL + "api/getdata", {
      method: "POST",
      body: JSON.stringify(inputData),
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
        dispatch(saveData(res));
        dispatch(progressStop());
        history.push("/app/db/data");
      })
      .catch(res => {
        dispatch(progressStop());
        dispatch(setError(res));
      });
  };
}

function saveData(data) {
  return {
    type: SAVE_DATA,
    payload: data
  };
}

export function changePage(nextPage) {
  return {
    type: CHANGE_PAGE,
    payload: nextPage
  };
}

export function sortData(columnIndex) {
  return {
    type: SORT_DATA,
    payload: columnIndex
  };
}

function updateState(rowIndex, newRow) {
  return {
    type: UPDATE_STATE,
    payload: {
      rowIndex,
      newRow
    }
  };
}

export function editData(rowIndex, newRow, editedData, pKey, closeDialog, userData) {
  return dispatch => {
    dispatch(progressStart());
    fetch(SITE_URL + "api/editData", {
      method: "POST",
      body: JSON.stringify({
        editedData,
        pKey,
        userData
      }),
      headers: {
        "Content-Type": "application/json"
      }
    })
      .then(response => {
        if (!response.ok) {
          return response.text();
        }
        return Promise.resolve();
      })
      .then(res => {
        if (typeof res === "string") {
          throw res;
        }
        dispatch(updateState(rowIndex, newRow));
        closeDialog();
        dispatch(progressStop());
      })
      .catch(res => {
        dispatch(progressStop());
        closeDialog();
        dispatch(setError(res));
      });
  };
}
