/**
 * Reducer обслуживающий компоненты отвечающие за страницы поиска и результата запроса к БД.
 *
 * @module src/reducers/dataBaseReducer
 */

"use strict";

import {
  INIT_FORM,
  SET_INITIAL_STATE,
  UPDATE_FORM,
  SAVE_DATA,
  CHANGE_PAGE,
  SORT_DATA,
  UPDATE_STATE
} from "../actions/actionTypes";
import { MAX_ROWS } from "../constants";

const initialState = {
  formData: [],
  sortOrder: [],
  obtainedData: {
    header: [],
    atrType: [],
    data: [],
    primaryKey: -1,
    editableAtr: {}
  },
  dataNavState: {
    pages: 1,
    activePage: 1
  }
};

export default function(state = initialState, action) {
  switch (action.type) {
    case SET_INITIAL_STATE:
      return initialState;
    case INIT_FORM:
      return initForm(state, action.payload);
    case UPDATE_FORM:
      return updateForm(state, action.payload);
    case SAVE_DATA:
      return saveData(state, action.payload);
    case CHANGE_PAGE:
      return changePage(state, action.payload);
    case SORT_DATA:
      return sortData(state, action.payload);
    case UPDATE_STATE:
      return editData(state, action.payload.rowIndex, action.payload.newRow);
    default:
      return state;
  }
}

function initForm(state, atrList) {
  const formData = atrList.map(item => {
    return {
      name: item,
      checked: false,
      operator: 0,
      operand: ""
    };
  });
  return { ...state, formData };
}

function updateForm(state, formData) {
  return { ...state, formData };
}

function saveData(state, obtainedData) {
  return {
    ...state,
    obtainedData,
    dataNavState: {
      pages: Math.ceil(obtainedData.data.length / MAX_ROWS),
      activePage: 1
    },
    sortOrder: obtainedData.header.map(() => false)
  };
}

function changePage(state, nextPage) {
  const dataNavState = {
    pages: state.dataNavState.pages,
    activePage: nextPage
  };
  return { ...state, dataNavState };
}

function sortData(state, columnIndex) {
  const sortFn = (order) => (a, b) => {
    const x = a[columnIndex];
    const y = b[columnIndex];

    if (x === y) {
      return 0;
    }

    if (order && y === null) {
      return 1;
    } else if (!order && x === null) {
      return 1;
    }

    return x > y ? order * 2 - 1 : !order * 2 - 1;
  };
  
  return {
    ...state,
    sortOrder: state.sortOrder.map((item, index) => index === columnIndex ? !item : item),
    obtainedData: {
      ...state.obtainedData,
      data: state.obtainedData.data
        .map(item => item)
        .sort(sortFn(state.sortOrder[columnIndex]))
    }
  }
}

function editData(state, rowIndex, newRow) {
  const newData = { ...state.obtainedData };
  newData.data = newData.data.map(item => item);
  newData.data[rowIndex] = newRow;
  
  return { ...state, obtainedData: newData };
}
