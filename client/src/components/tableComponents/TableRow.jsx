/**
 * Компоенет описывающий строку таблицы
 *
 * @module src/components/tableComponents/TableRow
 */

import React, { PureComponent } from "react";
import PropTypes from "prop-types";

import TableCell from "./TableCell";

/**
 * @param {Array} mainElements - основные элементы строки
 * @param {Array} auxElements - вспомогательные элементы строки
 * @param {number} primaryKey - Номер колонки, которая содержит информацию о первичном ключе главной таблицы БД.
 * @param {number} rowIndex - Номер строки
 * @param {Array} rowMask - Массив содержащий информацию для каких столбцов в данной строке данные были изменены
 * @param {string} rowClass - Имя css-класса строки
 * @param {string} cellClass - Имя css-класса ячейки
 * @param {string} name - добавочный префикс для ключа элемента
 * @param {Object} classes
 * @extends PureComponent
 */
class TableRow extends PureComponent {
  render() {
    const {
      mainElements,
      auxElements = [],
      rowClass = "",
      cellClass = "",
      name = "",
      primaryKey,
      rowIndex,
      rowMask = [],
      classes
    } = this.props;

    let i, j = 0, row = [];
    for (i = 0; i < auxElements.length; i++) {
      row.push(
        <td className={cellClass} key={name + j}>
          {React.cloneElement(auxElements[i], { pKey: mainElements[primaryKey], rowIndex })}
        </td>
      );
      j++;
    }
    for (i = 0; i < mainElements.length; i++) {
      row.push(
        <TableCell
          className={cellClass + (rowMask[i] ? " " + classes.markedCell : "")}
          key={name + j}
        >
          {mainElements[i]}
        </TableCell>
      );
      j++;
    }

    return <tr className={rowClass}>{row}</tr>;
  }
}
/** Проверка типов props */
TableRow.propTypes = {
  mainElements: PropTypes.array.isRequired,
  auxElements: PropTypes.arrayOf(PropTypes.element),
  primaryKey: PropTypes.number,
  rowClass: PropTypes.string,
  cellClass: PropTypes.string,
  name: PropTypes.string,
  rowIndex: PropTypes.number.isRequired,
  rowMask: PropTypes.arrayOf(PropTypes.bool),
  classes: PropTypes.object
};

export default TableRow;