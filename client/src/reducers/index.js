/**
 * Комбинирует все reducer'ы приложение в один для передачи в функцию createStore.
 *
 * @module src/reducers/index
 */

"use strict";

import { combineReducers } from "redux";
import loginReducer from "./loginReducer";
import errorReducer from "./errorReducer";
import dataBaseReducer from "./dataBaseReducer";
import updateReducer from "./updateReducer";
import progressReducer from "./progressReducer";

export default combineReducers({
  loginReducer,
  errorReducer,
  dataBaseReducer,
  updateReducer,
  progressReducer
});
