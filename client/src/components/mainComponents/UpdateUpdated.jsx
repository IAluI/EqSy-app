/**
 * Компонент отображающий страницу с результатами анализа фала ведомости, а именно записи для которых были онаружены
 * изменения.
 *
 * @module src/components/mainComponents/UpdateUpdated
 */

"use strict";

import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import XLSX from "xlsx";
import FileSaver from "file-saver";
import memoize from "memoize-one";

import Button from "@material-ui/core/Button";

import MyTable from "../tableComponents/Table";
import BottomMenu from "../bottomMenuComponents/BottomMenu";
import NavPanel from "../bottomMenuComponents/NavPanel";
import RowNumber from "../auxComponents/RowNumber";
import SelectRow from "../auxComponents/SelectRow";

import { MAX_ROWS } from "../../constants";

import {
  changePageUpd,
  sortTable,
  updateTableState,
  updateData
} from "../../actions/updateActions";

/**
 * @param {Array} header - Массив определяющий заголовок таблицы
 * @param (Array) data - Массив содержащий массивы определяющие строки таблицы
 * @param (Array) atrType - Массив определяющий типы данных колонок таблицы
 * @param (func) activePage - Текущая страница
 * @param (func) getData - Всего страниц
 * @extends Component
 */
class UpdateUpdated extends Component {
  constructor(props) {
    super();

    this.state = {
      append: props.append,
      targetTable: "updated"
    };

    this.computePageData = memoize((newPage, data) => {
      const curData = data.slice((newPage - 1) * MAX_ROWS, newPage * MAX_ROWS);
      let indexNum = {};
      curData.forEach((item, index) => {
        indexNum[index] = index + 1 + (newPage - 1) * MAX_ROWS;
      });

      return {
        curData,
        indexNum
      };
    });

    this.exportCSV = this.exportCSV.bind(this);
    this.exportExcel = this.exportExcel.bind(this);
    this.selectRow = this.selectRow.bind(this);
    this.saveToDb = this.saveToDb.bind(this);

    this.navPanel = memoize((activePage, pages) => (
      <NavPanel
        activePage={activePage}
        pages={pages}
        changePage={props.changePageUpd}
        targetTable={this.state.targetTable}
        key="navPanel"
      />
    ));
    this.exportCsvButton = (
      <Button
        variant="contained"
        color="primary"
        onClick={this.exportCSV}
        key="exportCsvButton"
      >
        Экспорт в CSV
      </Button>
    );
    this.exportExcelButton = (
      <Button
        variant="contained"
        color="primary"
        onClick={this.exportExcel}
        key="exportExcelButton"
      >
        Экспорт в Excel
      </Button>
    );
    this.saveButton = (
      <Button
        variant="contained"
        color="primary"
        onClick={this.saveToDb}
        key="saveButton"
      >
        Сохранить в БД
      </Button>
    );
    this.menuChildren = memoize((elem1, elem2, elem3, elem4) => [
      elem1,
      elem2,
      elem3,
      elem4
    ]);
  }
  /**
   * Сохраняет текущее состояние компонента в redux store перед демонтированием компонента.
   */
  componentWillUnmount() {
    this.props.updateTableState(
      {
        append: this.state.append
      },
      this.state.targetTable
    );
  }

  exportCSV() {
    const workSheet = XLSX.utils.aoa_to_sheet([
      this.props.header,
      ...this.props.data
    ]);
    const blob = new Blob([XLSX.utils.sheet_to_csv(workSheet)], {
      type: "text/plain;charset=utf-8"
    });
    FileSaver.saveAs(blob, "someData.csv");
  }

  exportExcel() {
    let workBook = XLSX.utils.book_new();
    const workSheet = XLSX.utils.aoa_to_sheet([
      this.props.header,
      ...this.props.data
    ]);
    XLSX.utils.book_append_sheet(workBook, workSheet, "Sheet");
    XLSX.writeFile(workBook, "someData.xlsx");
  }

  selectRow(pKey) {
    return () => {
      let append = { ...this.state.append };
      append[pKey] = !append[pKey];
      this.setState({ append });
    };
  }

  saveToDb() {
    let selectedData = {};
    for (let key in this.state.append) {
      if (this.state.append[key]) {
        selectedData[key] = this.props.dataForDb[key];
      }
    }

    this.props.updateData(
      this.state.targetTable,
      this.props.userName,
      this.props.token,
      selectedData
    );
  }

  render() {
    if (this.props.data.length === 0) {
      return <h1 style={{ textAlign: "center" }}>{"Нет данных"}</h1>;
    }

    const { curData, indexNum } = this.computePageData(this.props.activePage, this.props.data);
    const navPanel = this.navPanel(this.props.activePage, this.props.pages, this.props.changePageUpd);
    const menuChildren = this.menuChildren(navPanel, this.exportCsvButton, this.exportExcelButton, this.saveButton);

    return (
      <Fragment>
        <MyTable
          header={this.props.header}
          data={curData}
          columnWidth={[100, 80]}
          fixHeader={true}
          auxHeader={["Добавить в БД", "№"]}
          auxElements={[
            <SelectRow
              isSelected={this.state.append}
              onSelect={this.selectRow}
            />,
            <RowNumber indexNum={indexNum} />
          ]}
          primaryKey={this.props.primaryKey}
          sortHandler={this.props.sortTable}
          targetTable={this.state.targetTable}
          tableMask={this.props.tableMask}
        />
        <BottomMenu>{menuChildren}</BottomMenu>
      </Fragment>
    );
  }
}
/** Проверка типов props */
UpdateUpdated.propTypes = {
  header: PropTypes.array.isRequired,
  data: PropTypes.arrayOf(PropTypes.array).isRequired,
  activePage: PropTypes.number.isRequired,
  pages: PropTypes.number.isRequired,
  changePageUpd: PropTypes.func.isRequired,
  dataForDb: PropTypes.object.isRequired,
  primaryKey: PropTypes.number.isRequired,
  append: PropTypes.objectOf(PropTypes.bool).isRequired,
  tableMask: PropTypes.objectOf(PropTypes.array),
  sortTable: PropTypes.func.isRequired,
  updateTableState: PropTypes.func.isRequired,
  updateData: PropTypes.func.isRequired,
  userName: PropTypes.string.isRequired,
  token: PropTypes.number.isRequired
};
/** Функция описывает какие данные из Redux-store необходимо передать компоненту */
function mapStateToProps(state) {
  return {
    header: state.updateReducer.header,
    data: state.updateReducer.updated.dataForTable,
    activePage: state.updateReducer.updated.activePage,
    pages: state.updateReducer.updated.pages,
    dataForDb: state.updateReducer.updated.dataForDb,
    append: state.updateReducer.updated.append,
    tableMask: state.updateReducer.updated.tableMask,
    primaryKey: state.updateReducer.primaryKey,
    userName: state.loginReducer.userName,
    token: state.loginReducer.token
  };
}
/** Объект содержит action creators которые компонент будет использовать */
const mapDispatchToProps = {
  changePageUpd,
  sortTable,
  updateTableState,
  updateData
};

export default connect(mapStateToProps, mapDispatchToProps)(UpdateUpdated);
