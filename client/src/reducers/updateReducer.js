/**
 * Reducer обслуживающий компоненты отвечающие за страницы обновления базы данных с использлванием заружаемого файла
 * (ведомости).
 *
 * @module src/reducers/updateReducer
 */

"use strict";

import {
  SET_INITIAL_STATE,
  SET_LOG,
  SET_COMPARE_RESULT,
  CHANGE_PAGE_UPD,
  SORT_TABLE,
  UPDATE_TABLE_STATE,
  CLEAR_TABLE
} from "../actions/actionTypes";

const initialState = {
  logArr: [],
  header: [],
  primaryKey: -1,
  added: {
    dataForTable: [],
    dataForDb: [],
    headerForDb: [],
    pages: 1,
    activePage: 1,
    sortOrder: [],
    append: {},
    niiulEquipment: {},
    ouieoOkof: {}
  },
  updated: {
    dataForTable: [],
    dataForDb: {},
    pages: 1,
    activePage: 1,
    sortOrder: [],
    append: {}
  },
  deleted: {
    dataForTable: [],
    dataForDb: [],
    pages: 1,
    activePage: 1,
    sortOrder: [],
    append: {}
  }
};

export default function(state = initialState, action) {
  switch (action.type) {
    case SET_INITIAL_STATE:
      return initialState;
    case SET_LOG:
      return setLog(state, action.payload);
    case SET_COMPARE_RESULT:
      return setCompareReult(state, action.payload);
    case CHANGE_PAGE_UPD:
      return changePageUpd(state, action.payload.table, action.payload.nextPage);
    case SORT_TABLE:
      return sortTable(
        state,
        action.payload.columnIndex,
        action.payload.targetTable
      );
    case UPDATE_TABLE_STATE:
      return updateTableState(
        state,
        action.payload.newState,
        action.payload.targetTable
      );
    case CLEAR_TABLE:
      return clearTable(state, action.payload);
    default:
      return state;
  }
}

function setLog(state, logArr) {
  return { ...state, logArr };
}

function setCompareReult(state, result) {
  return { ...state, ...result };
}

function changePageUpd(state, targetTable, nextPage) {
  return {
    ...state,
    [targetTable]: {
      ...state[targetTable],
      activePage: nextPage
    }
  };
}

function sortTable(state, columnIndex, targetTable) {
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
    [targetTable]: {
      ...state[targetTable],
      sortOrder: state[targetTable].sortOrder.map((item, index) => index === columnIndex ? !item : item),
      dataForTable: state[targetTable].dataForTable
        .map(item => item)
        .sort(sortFn(state[targetTable].sortOrder[columnIndex]))
    }
  };
}

function updateTableState(state, newState, targetTable) {
  return {
    ...state,
    [targetTable]: { ...state[targetTable], ...newState }
  };
}

function clearTable(state, tableName) {
  return {
    ...state,
    [tableName]: initialState[tableName]
  };
}