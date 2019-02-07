/**
 * Компонент отображающий номер строки в таблице.
 *
 * @module src/components/auxComponents/RowNumber
 */

"use strict";

import React, { Component } from "react";
import PropTypes from "prop-types";

/**
 * @param {number[]} indexNum - Массив номеров строк заданный для текущей страницы таблицы
 * @param {number} rowIndex - Номер строки на текущей страницы
 * @extends Component
 */
class RowNumber extends Component {
  shouldComponentUpdate(nextProps) {
    return this.props.indexNum[this.props.rowIndex] !== nextProps.indexNum[nextProps.rowIndex];
  }

  render() {
    const { rowIndex, indexNum } = this.props;
    return indexNum[rowIndex];
  }
}
/** Проверка типов props */
RowNumber.propTypes = {
  rowIndex: PropTypes.number,
  indexNum: PropTypes.objectOf(PropTypes.number).isRequired
};
export default RowNumber;