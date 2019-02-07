/**
 * Компоенет определяющий таблицу
 *
 * @module src/components/tableComponents/Table
 */

"use strict";

import React, { Component, PureComponent, Fragment } from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";

import { DEFAULT_COL_WIDTH } from "../../constants";


import TableRow from "./TableRow";
import HeaderRow from "./HeaderRow";
import ColGroup from "./ColGroup";

const styles = theme => ({
  container: {
    height: "calc(100% - 60px)"
  },
  table: {
    tableLayout: "fixed",
    borderCollapse: "collapse"
  },
  header: {
    ...theme.typography.h5,
    color: theme.palette.common.white,
    backgroundColor: theme.palette.primary.dark
  },
  fixedHeaderCell: {
    borderBottom: "3px solid black",
    wordWrap: "break-word"
  },
  hoverHeaderCell: {
    "&:hover": {
      color: theme.palette.primary.light
    }
  },
  body: {
    ...theme.typography.body1,
    overflow: "auto",
    wordWrap: "break-word"
  },
  cell: {
    padding: "5px",
    fontWeight: "inherit",
    textAlign: "left",
    "&:first-child": {
      paddingLeft: 30
    },
    "&:last-child": {
      paddingRight: 30
    }
  },
  markedCell: {
    color: "red"
  },
  fixedDiv: {
    overflowX: "hidden",
    overflowY: "scroll"
  },
  evenRow: {
    backgroundColor: "paleturquoise" //'aliceblue'
  }
});
/**
 * @param {Array} header - Заголовок таблицы
 * @param {Array[]} data - Данные таблицы
 * @param {Array} auxHeader - Функция возвращающая заголовок вспомогательных элементов таблицы
 * @param {Array} auxElements - Функция возвращающая вспомогательные элементы таблицы с учетом индекса строки
 * во внешнем хранилище данных
 * @param {boolean} fixHeader - Фиксировать шапку таблицы
 * @param {number} fixColumns - !!!Количество фиксированных столбцов в таблице. На даннный Момент не реализованно!!!
 * @param {(Array | number)} columnWidth - Массив или значение определяющее ширину столбцов таблицы. Если значение, то
 * все колонки в таблице будут иметь одинаковую ширину равную columnWidth пикселей. Если массив, то iый столбец таблицы
 * будут имет длинну columnWidth[i] пикселей, если в таблице больше столбцов чем columnWidth.length, то оставшиеся
 * столбцы будут имет ширину по умолчанию.
 * @param {object} classes - Объект с именами css-классов
 * @extends Component
 */
class MyTable extends Component {
  constructor(props) {
    super();

    const { header, auxHeader = [], columnWidth } = props;

    const getWidth = (colWidth => {
      if (typeof colWidth === "object" && Array.isArray(colWidth)) {
        return i => {
          if (i < columnWidth.length) {
            return columnWidth[i];
          } else {
            return DEFAULT_COL_WIDTH;
          }
        };
      }
      if (typeof colWidth === "number") {
        return () => colWidth;
      }
      return () => DEFAULT_COL_WIDTH;
    })(columnWidth);
    let tableWidth = 0;
    let columns = [];
    for (let i = 0; i < header.length + auxHeader.length; i++) {
      columns.push(getWidth(i));
      tableWidth += getWidth(i);
    }

    this.state = {
      tableWidth,
      columns
    };

    this.resizeBody = this.resizeBody.bind(this);
    this.scrollBind = this.scrollBind.bind(this);
  }
  /**
   * Вызывается после окончания монтирования компонента. Сохраняет ссылки на контейнеры заголовка и тела таблицы.
   * Добавляет EventListeners для реализации горизонтальной прокрутки заголовка в случае фиксированной таблицы, а
   * также для динамического изменения контейнера тела таблицы. Инициализирует размер конетейнера тела таблицы.
   */
  componentDidMount() {
    this.body = document.getElementById("body");
    this.header = {};
    if (this.props.fixHeader) {
      this.header = document.getElementById("header");
      this.body.addEventListener("scroll", this.scrollBind);
    }

    this.resizeBody();
    window.addEventListener("resize", this.resizeBody);
  }
  /**
   * Удаляет EventListeners перед размонтированием компонента.
   */
  componentWillUnmount() {
    if (this.props.fixHeader) {
      document
        .getElementById("body")
        .removeEventListener("scroll", this.scrollBind);
    }
    window.removeEventListener("resize", this.resizeBody);
  }

  /**
   * Обработчик события горизонтальной прокрутки контейнера тела таблицы. Связывает прокуртку контейнера тела таблицы
   * с прокурткой контейнера заголовка таблицы
   *
   * @param {object} e - объект события SyntheticEvent
   */
  scrollBind(e) {
    if (this.header.scrollLeft != e.target.scrollLeft) {
      this.header.scrollLeft = e.target.scrollLeft;
    }
  }

  /**
   * Обработчик события изменения экрана браузера. Изменяет высоту контейнера тела таблицы в соответсвии с высотой
   * окна браузера
   *
   * @param {object} e - объект события SyntheticEvent
   */
  resizeBody(e) {
    if (this.wndHeight !== document.documentElement.clientHeight) {
      this.body.style.height = "" + (body.parentElement.offsetHeight - (this.header.offsetHeight || 0)) + "px";
    }
  }
  
  render() {
    const {
      classes,
      header,
      data,
      auxHeader,
      auxElements,
      fixHeader = false,
      fixColumns = 0,
      primaryKey,
      sortHandler,
      targetTable,
      tableMask = []
    } = this.props;

    if (fixHeader) {
      return (
        <div className={classes.container}>
          <div id="header" className={classes.fixedDiv}>
            <table
              className={classes.table}
              style={{ width: this.state.tableWidth }}
            >
              <ColGroup columns={this.state.columns} name="headCol" />
              <thead>
                <HeaderRow
                  auxElements={auxHeader}
                  mainElements={header}
                  rowClass={classes.header}
                  cellClass={classes.cell + " " + classes.fixedHeaderCell}
                  name="header"
                  sortHandler={sortHandler}
                  targetTable={targetTable}
                  classes={classes}
                />
              </thead>
            </table>
          </div>
          <div id="body" className={classes.body}>
            <table
              className={classes.table}
              style={{ width: this.state.tableWidth }}
            >
              <ColGroup columns={this.state.columns} name="bodyCol" />
              <tbody>
                {data.map((item, index) => (
                  <TableRow
                    auxElements={auxElements}
                    primaryKey={primaryKey}
                    mainElements={item}
                    rowIndex={index}
                    rowMask={tableMask[item[primaryKey]]}
                    rowClass={index & 1 ? classes.evenRow : ""}
                    cellClass={classes.cell}
                    name={"bodyCell" + index}
                    key={"bodyRow" + index}
                    classes={classes}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    } else {
      return (
        <div id="body" className={classes.body + " " + classes.container}>
          <table
            className={classes.table}
            style={{ width: this.state.tableWidth }}
          >
            <ColGroup columns={this.state.columns} name="headCol" />
            <thead>
              <HeaderRow
                auxElements={auxHeader}
                mainElements={header}
                rowClass={classes.header}
                cellClass={headerRowClasses}
                name="header"
                sortHandler={sortHandler}
                targetTable={targetTable}
                classes={classes}
              />
            </thead>
            <tbody>
              {data.map((item, index) => (
                <TableRow
                  auxElements={auxElements}
                  primaryKey={primaryKey}
                  mainElements={item}
                  rowIndex={index}
                  rowMask={tableMask[item[primaryKey]]}
                  rowClass={index & 1 ? classes.evenRow : ""}
                  cellClass={classes.cell}
                  name={"bodyCell" + index}
                  key={"bodyRow" + index}
                  classes={classes}
                />
              ))}
            </tbody>
          </table>
        </div>
      );
    }
  }
}
/** Проверка типов props */
MyTable.propTypes = {
  header: PropTypes.node.isRequired,
  data: PropTypes.arrayOf(PropTypes.array).isRequired,
  auxHeader: PropTypes.arrayOf(PropTypes.string),
  auxElements: PropTypes.arrayOf(PropTypes.element),
  primaryKey: PropTypes.number,
  fixHeader: PropTypes.bool,
  fixColumns: PropTypes.number,
  columnWidth: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.arrayOf(PropTypes.number)
  ]),
  classes: PropTypes.object,
  sortHandler: PropTypes.func,
  tableMask: PropTypes.objectOf(PropTypes.array),
  targetTable: PropTypes.string
};

export default withStyles(styles)(MyTable);
