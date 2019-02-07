/**
 * Компоенет описывающий ячейку таблицы
 *
 * @module src/components/tableComponents/TableCell
 */

import React, { PureComponent } from "react";
import PropTypes from "prop-types";

class TableCell extends PureComponent {
  render() {
    let child;
    if (typeof this.props.children !== "boolean") {
      child = this.props.children;
    } else if (this.props.children === true) {
      child = "Да";
    } else {
      child = "Нет";
    }
    return <td className={this.props.className}>{child}</td>;
  }
}
/** Проверка типов props */
TableCell.propTypes = {
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.bool]),
  className: PropTypes.string
};
export default TableCell;