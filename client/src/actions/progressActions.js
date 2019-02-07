/**
 * Action creators для компонента отоброжающего выполнение какой либо задачи приложением.
 *
 * @module src/actions/progressActions
 */

"use strict";

import { PROGRESS_START, PROGRESS_STOP } from "../actions/actionTypes";

export function progressStart() {
  return {
    type: PROGRESS_START
  };
}

export function progressStop() {
  return {
    type: PROGRESS_STOP
  };
}
