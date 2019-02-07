/**
 * Компоенет описывающий колонки таблицы
 *
 * @module src/components/tableComponents/TableCell
 */

import React, { PureComponent, Fragment } from "react";
import PropTypes from "prop-types";

/**
 * @param {Array} columns - Мыссив определяющий ширину колонок таблицы
 * @param {string} name - добавочный префикс для ключа элемента
 * @extends PureComponent
 */
class ColGroup extends PureComponent {
  render() {
    const { columns, name } = this.props;
    
    return (
      <Fragment>
        {columns.map((item, index) => (
          <colgroup width={item + "px"} key={name + index} />
        ))}
      </Fragment>
    );
  }
}
/** Проверка типов props */
ColGroup.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.number).isRequired,
  name: PropTypes.string
};

export default ColGroup;