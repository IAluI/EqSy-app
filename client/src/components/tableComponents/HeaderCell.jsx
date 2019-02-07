/**
 * Компоенет описывающий ячейку заголовка таблицы
 *
 * @module src/components/tableComponents/TableCell
 */

import React, { PureComponent } from "react";
import PropTypes from "prop-types";

/**
 * @param {function} children
 * @param {string} className
 * @param {function} sortHandler - Action creator вызывающий сортировку таблицы по колонке index
 * @param {number} index - Номер текущей колонки таблицы 
 * @param {string} targetTable - Имя таблицы в Redux store
 * @extends PureComponent
 */
class HeaderCell extends PureComponent {
  render() {
    const { children, className, sortHandler, index, targetTable } = this.props;

    return (
      <th
        className={className}
        onClick={sortHandler ? () => {sortHandler(index, targetTable)}: null}
      >
        {children}
      </th>
    );
  }
}
/** Проверка типов props */
HeaderCell.propTypes = {
  children: PropTypes.string.isRequired,
  className: PropTypes.string,
  sortHandler: PropTypes.func,
  index: PropTypes.number,
  targetTable: PropTypes.string
};

export default HeaderCell;