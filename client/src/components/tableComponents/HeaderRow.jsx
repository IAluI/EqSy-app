/**
 * Компоенет описывающий строку заголовока таблицы
 *
 * @module src/components/tableComponents/HeaderRow
 */

import React, { PureComponent } from "react";
import PropTypes from "prop-types";

import HeaderCell from "./HeaderCell";

/**
 * @param {Array} mainElements - основные элементы строки
 * @param {Array} auxElements - вспомогательные элементы строки
 * @param {string} rowClass - Имя css-класса строки
 * @param {string} cellClass - Имя css-класса ячейки
 * @param {string} name - добавочный префикс для ключа элемента
 * @param {Object} classes
 * @extends PureComponent
 */
class HeaderRow extends PureComponent {
  render() {
    const {
      mainElements,
      auxElements = [],
      rowClass = "",
      cellClass = "",
      name = "",
      sortHandler,
      targetTable,
      classes
    } = this.props;

    let i, j = 0, row = [];
    for (i = 0; i < auxElements.length; i++) {
      row.push(
        <HeaderCell className={cellClass} key={name + j}>
          {auxElements[i]}
        </HeaderCell>
      );
      j++;
    }
    for (i = 0; i < mainElements.length; i++) {
      row.push(
        <HeaderCell
          className={
            cellClass + (sortHandler ? " " + classes.hoverHeaderCell : "")
          }
          key={name + j}
          sortHandler={sortHandler}
          index={i}
          targetTable={targetTable}
        >
          {mainElements[i]}
        </HeaderCell>
      );
      j++;
    }

    return <tr className={rowClass}>{row}</tr>;
  }
}
/** Проверка типов props */
HeaderRow.propTypes = {
  mainElements: PropTypes.arrayOf(PropTypes.string).isRequired,
  auxElements: PropTypes.arrayOf(PropTypes.string),
  rowClass: PropTypes.string,
  cellClass: PropTypes.string,
  name: PropTypes.string,
  classes: PropTypes.object
};

export default HeaderRow;