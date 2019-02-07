/**
 * Компонент отображающий страницу с результатами анализа фала ведомости, а именно обнаруженные записи о новопоступившем
 * оборудовании
 *
 * @module src/components/mainComponents/UpdateAdded
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
import OkofInput from "../auxComponents/OkofInput";

import { MAX_ROWS, SITE_URL } from "../../constants";

import { changePageUpd, sortTable, updateTableState, addData } from "../../actions/updateActions";
import { setError } from "../../actions/errorActions";

/**
 * @param {Array} header - Массив определяющий заголовок таблицы
 * @param (Array) data - Массив содержащий массивы определяющие строки таблицы
 * @param (Array) atrType - Массив определяющий типы данных колонок таблицы
 * @param (func) activePage - Текущая страница
 * @param (func) getData - Всего страниц
 * @extends Component
 */
class UpdateAdded extends Component {
  constructor(props) {
    super();

    this.state = {
      append: props.append,
      niiulEquipment: props.niiulEquipment,
      ouieoOkof: props.ouieoOkof,
      targetTable: "added"
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
    this.niiulCheck = this.niiulCheck.bind(this);
    this.selectOkof = this.selectOkof.bind(this);
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
        append: this.state.append,
        niiulEquipment: this.state.niiulEquipment,
        ouieoOkof: this.state.ouieoOkof
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

  niiulCheck(pKey) {
    return () => {
      let niiulEquipment = { ...this.state.niiulEquipment };
      niiulEquipment[pKey] = !niiulEquipment[pKey];
      this.setState({ niiulEquipment });
    };
  }

  selectOkof(pKey, okof) {
    let ouieoOkof = { ...this.state.ouieoOkof };
    ouieoOkof[pKey] = okof;
    this.setState({ ouieoOkof });
  }

  saveToDb() {
    let headerForDb = [];
    headerForDb.push(...this.props.headerForDb, "isNiiul", "ouieoOkofId");
    let pKeyValue,
      selectedData = [];
    this.props.dataForDb.forEach(item => {
      pKeyValue = item[this.props.primaryKey];
      if (this.state.append[pKeyValue]) {
        selectedData.push([
          ...item,
          this.state.niiulEquipment[pKeyValue],
          this.state.ouieoOkof[pKeyValue].id
        ]);
      }
    });

    this.props.addData(
      this.state.targetTable,
      this.props.userName,
      this.props.token,
      selectedData,
      this.props.headerForDb
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
          columnWidth={[100, 100, 150, 150, 80]}
          fixHeader={true}
          auxHeader={[
            "Добавить в БД",
            "НИиУЛ оборудование",
            "Код ОКОФ ОУиЭО",
            "Описание ОКОФ ОУиЭО",
            "№"
          ]}
          auxElements={[
            <SelectRow
              isSelected={this.state.append}
              onSelect={this.selectRow}
            />,
            <SelectRow
              isSelected={this.state.niiulEquipment}
              onSelect={this.niiulCheck}
            />,
            <OkofInput
              ouieoOkof={this.state.ouieoOkof}
              inputType="code"
              selectOkof={this.selectOkof}
              setError={this.props.setError}
              maxRow={MAX_ROWS}
              url={SITE_URL}
              userData={{
                userName: this.props.userName,
                token: this.props.token
              }}
            />,
            <OkofInput
              ouieoOkof={this.state.ouieoOkof}
              inputType="description"
              selectOkof={this.selectOkof}
              setError={this.props.setError}
              maxRow={MAX_ROWS}
              url={SITE_URL}
              userData={{
                userName: this.props.userName,
                token: this.props.token
              }}
            />,
            <RowNumber indexNum={indexNum} />
          ]}
          primaryKey={this.props.primaryKey}
          sortHandler={this.props.sortTable}
          targetTable={this.state.targetTable}
        />
        <BottomMenu>{menuChildren}</BottomMenu>
      </Fragment>
    );
  }
}
/** Проверка типов props */
UpdateAdded.propTypes = {
  header: PropTypes.array.isRequired,
  data: PropTypes.arrayOf(PropTypes.array).isRequired,
  activePage: PropTypes.number.isRequired,
  pages: PropTypes.number.isRequired,
  changePageUpd: PropTypes.func.isRequired,
  dataForDb: PropTypes.arrayOf(PropTypes.array).isRequired,
  headerForDb: PropTypes.array.isRequired,
  primaryKey: PropTypes.number.isRequired,
  append: PropTypes.objectOf(PropTypes.bool).isRequired,
  niiulEquipment: PropTypes.objectOf(PropTypes.bool).isRequired,
  ouieoOkof: PropTypes.objectOf(PropTypes.object).isRequired,
  sortTable: PropTypes.func.isRequired,
  updateTableState: PropTypes.func.isRequired,
  addData: PropTypes.func.isRequired,
  setError: PropTypes.func.isRequired,
  userName: PropTypes.string.isRequired,
  token: PropTypes.number.isRequired
};
/** Функция описывает какие данные из Redux-store необходимо передать компоненту */
function mapStateToProps(state) {
  return {
    header: state.updateReducer.header,
    data: state.updateReducer.added.dataForTable,
    activePage: state.updateReducer.added.activePage,
    pages: state.updateReducer.added.pages,
    dataForDb: state.updateReducer.added.dataForDb,
    headerForDb: state.updateReducer.added.headerForDb,
    append: state.updateReducer.added.append,
    niiulEquipment: state.updateReducer.added.niiulEquipment,
    ouieoOkof: state.updateReducer.added.ouieoOkof,
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
  addData,
  setError
};

export default connect(mapStateToProps, mapDispatchToProps)(UpdateAdded);
