/**
 * Компонент отображающий станицу с результатами запроса к БД.
 *
 * @module src/components/mainComponents/DataBaseData
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
import EditButton from "../auxComponents/EditButton";
import EditDialog from "../otherComponents/EditDialog";

import { MAX_ROWS } from "../../constants";

import { changePage, sortData, editData } from "../../actions/dataBaseActions";

/**
 * @param {Array} header - Массив определяющий заголовок таблицы
 * @param (Array) data - Массив содержащий массивы определяющие строки таблицы
 * @param (Array) atrType - Массив определяющий типы данных колонок таблицы
 * @param (number) activePage - Текущая страница
 * @param (number) pages - Всего страниц
 * @param {function} changePage - Action creator изменяющий текущую страницу
 * @param (number) primaryKey - Индекс колонки содержащей значения первичных атрибутов главной таблицы
 * @param (function) sortData - Action creator сортирующий строки таблицы по заданной колонке
 * @param (function) editData - Action creator вызывающий открытие диалога редактирования заданной строки таблицы
 * @param (boolean) editAllow - Имеет ли пользователь право редактировать БД
 * @param (Object) editableAtr - Обект содержащий информацию о именах колонок доступных для редактирования
 * @param (string) userName
 * @param (number) token
 * @extends Component
 */
class DataBaseData extends Component {
  constructor(props) {
    super();

    this.state = {
      open: false,
      rowIndex: 0
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
    this.openEditDialog = this.openEditDialog.bind(this);
    this.closeEditDialog = this.closeEditDialog.bind(this);

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
    this.navPanel = memoize((activePage, pages) => (
      <NavPanel
        activePage={activePage}
        pages={pages}
        changePage={props.changePage}
        key="navPanel"
      />
    ));
    this.menuChildren = memoize((elem1, elem2, elem3) => [elem1, elem2, elem3]);    
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

  openEditDialog(rowIndex) {
    this.setState({
      open: true,
      rowIndex: rowIndex + (this.props.activePage - 1) * MAX_ROWS
    });
  }

  closeEditDialog() {
    this.setState({
      open: false,
      rowIndex: 0
    });
  }

  render() {
    if (this.props.data.length === 0) {
      return <h1 style={{ textAlign: "center" }}>{"Нет данных"}</h1>;
    }

    const { curData, indexNum } = this.computePageData(this.props.activePage, this.props.data);
    const navPanel = this.navPanel(this.props.activePage, this.props.pages);
    const menuChildren = this.menuChildren(navPanel, this.exportCsvButton, this.exportExcelButton);

    if (this.props.editAllow && this.props.primaryKey !== -1) {
      return (
        <Fragment>
          <EditDialog
            isOpen={this.state.open}
            onClose={this.closeEditDialog}
            onSave={this.props.editData}
            header={this.props.header}
            data={this.props.data[this.state.rowIndex]}
            rowIndex={this.state.rowIndex}
            primaryKey={this.props.primaryKey}
            editableAtr={this.props.editableAtr}
            userData={{
              userName: this.props.userName,
              token: this.props.token
            }}
          />
          <MyTable
            header={this.props.header}
            data={curData}
            columnWidth={[130, 80]}
            fixHeader={true}
            auxHeader={["Редактировать", "№"]}
            auxElements={[
              <EditButton onClick={this.openEditDialog} />,
              <RowNumber indexNum={indexNum} />
            ]}
            primaryKey={this.props.primaryKey}
            sortHandler={this.props.sortData}
          />
          <BottomMenu>{menuChildren}</BottomMenu>
        </Fragment>
      );
    }
    return (
      <Fragment>
        <MyTable
          header={this.props.header}
          data={curData}
          columnWidth={[100]}
          fixHeader={true}
          auxHeader={["№"]}
          auxElements={[<RowNumber indexNum={indexNum} />]}
          primaryKey={this.props.primaryKey}
          sortHandler={this.props.sortData}
        />
        <BottomMenu>{menuChildren}</BottomMenu>
      </Fragment>
    );
  }
}
/** Проверка типов props */
DataBaseData.propTypes = {
  header: PropTypes.array.isRequired,
  data: PropTypes.arrayOf(PropTypes.array).isRequired,
  atrType: PropTypes.array, // Не используется на данный момент
  activePage: PropTypes.number.isRequired,
  pages: PropTypes.number.isRequired,
  changePage: PropTypes.func.isRequired,
  primaryKey: PropTypes.number.isRequired,
  sortData: PropTypes.func.isRequired,
  editData: PropTypes.func.isRequired,
  editAllow: PropTypes.bool.isRequired,
  editableAtr: PropTypes.objectOf(PropTypes.bool).isRequired,
  userName: PropTypes.string.isRequired,
  token: PropTypes.number.isRequired
};
/** Функция описывает какие данные из Redux-store необходимо передать компоненту */
function mapStateToProps(state) {
  return {
    header: state.dataBaseReducer.obtainedData.header,
    data: state.dataBaseReducer.obtainedData.data,
    atrType: state.dataBaseReducer.obtainedData.atrType,
    activePage: state.dataBaseReducer.dataNavState.activePage,
    pages: state.dataBaseReducer.dataNavState.pages,
    primaryKey: state.dataBaseReducer.obtainedData.primaryKey,
    editAllow: state.loginReducer.editAllow,
    editableAtr: state.dataBaseReducer.obtainedData.editableAtr,
    userName: state.loginReducer.userName,
    token: state.loginReducer.token
  };
}
/** Объект содержит action creators которые компонент будет использовать */
const mapDispatchToProps = {
  changePage,
  sortData,
  editData
};

export default connect(mapStateToProps, mapDispatchToProps)(DataBaseData);
