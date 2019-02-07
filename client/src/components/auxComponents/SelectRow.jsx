/**
 * Компонент отображающий сheckbox служащий для выбора строк в таблице.
 *
 * @module src/components/auxComponents/RowNumber
 */

"use strict";

import React, { Component } from "react";
import PropTypes from "prop-types";

import Checkbox from "@material-ui/core/Checkbox";

/**
 * @param {string} pKey - Значение первичного ключа соответвующие текущей строке таблицы
 * @param {Object} isSelected - Объект содержащий данные о том какие значения первичных ключей выбранны
 * @param {function} onSelect - Функция обрабатывающая выбор текущего первичного ключа
 * @extends Component
 */
class SelectRow extends Component {
  shouldComponentUpdate(nextProps) {
    return (
      this.props.isSelected[this.props.pKey] !== nextProps.isSelected[nextProps.pKey] ||
      this.props.pKey !== nextProps.pKey
    );
  }

  render() {
    const { pKey, isSelected, onSelect } = this.props;

    return (
      <Checkbox
        color="primary"
        checked={isSelected[pKey]}
        onChange={onSelect(pKey)}
      />
    );
  }
}
/** Проверка типов props */
SelectRow.propTypes = {
  pKey: PropTypes.string,
  isSelected: PropTypes.objectOf(PropTypes.bool).isRequired,
  onSelect: PropTypes.func.isRequired
};
export default SelectRow;
