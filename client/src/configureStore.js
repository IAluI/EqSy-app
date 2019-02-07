/**
 * Инициализирует Redux.
 *
 * @module src/configureStore
 */

"use strict";

import { applyMiddleware, compose, createStore } from "redux";
import thunkMiddleware from "redux-thunk";

import reducer from "./reducers/index";

export default function configureStore(preloadedState) {
  const middlewares = [thunkMiddleware];
  const middlewareEnhancer = applyMiddleware(...middlewares);
  
  return createStore(reducer, preloadedState, middlewareEnhancer);
}
