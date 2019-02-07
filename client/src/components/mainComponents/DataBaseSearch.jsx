/**
 * Компонент отображающий станицу поиска данных в БД.
 *
 * @module src/components/mainComponents/DataBaseSearch
 */

"use strict";

import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import memoize from "memoize-one";

import Checkbox from "@material-ui/core/Checkbox";
import NativeSelect from "@material-ui/core/NativeSelect";
import TextField from "@material-ui/core/TextField";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Button from "@material-ui/core/Button";

import MyTable from "../tableComponents/Table";
import BottomMenu from "../bottomMenuComponents/BottomMenu";

import { updateForm, getData } from "../../actions/dataBaseActions";

/**
 * Компонент отображающий выбор оператора из списка.
 * @param {number} value - Текущее состояние
 * @param {function} onChange - Функция изменения текущего состояния
 */
function MySelect({ value, onChange }) {
  return (
    <NativeSelect value={value} onChange={onChange} >
      <option value={0} >{"="}</option>
      <option value={1} >{"!="}</option>
      <option value={2} >{"<"}</option>
      <option value={3} >{"<="}</option>
      <option value={4} >{">"}</option>
      <option value={5} >{">="}</option>
      <option value={6} >{"~"}</option>
      <option value={7} >{"!~"}</option>
      <option value={8} >{"~*"}</option>
      <option value={9} >{"!~*"}</option>
      <option value={10} >{"IS NULL"}</option>
      <option value={11} >{"IS NOT NULL"}</option>
    </NativeSelect>
  );
}
/** Проверка типов props */
MySelect.propTypes = {
  value: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired
};
/**
 * @param {Array} formData - Массив объектов определяющий состояние формы поиска
 * @param (string) userName - Имя пользотвателя
 * @param (string) token - Токен пользотвателя
 * @param (function) updateForm - Action creator сохраняющий текущее состояние формы поиска при переходе на другую страницу
 * @param (function) getData - Action creator инициирующий запрос к базе данных
 * @extends Component
 */
class DataBaseSearch extends Component {
  /**
   * Создает экземпляр DataBaseSearch: выхываеь конструктор родителя, инициализирует state, привязывает методы к this.
   * @param {Object} props - Свойства компонента
   */
  constructor(props) {
    super();

    const header = ["Показать", "Атрибут", "Оператор", "Значение"];
    const columnWidth = [150, 200, 125, 250];
    const isCheckedAll = props.formData.every(item => item.checked);
    const isCheckedSome = !isCheckedAll && props.formData.some(item => item.checked === true);

    this.state = {
      formData: props.formData,
      isCheckedAll,
      isCheckedSome,
      header,
      columnWidth
    };

    this.handleView = this.handleView.bind(this);
    this.handleViewAll = this.handleViewAll.bind(this);
    this.handleOperator = this.handleOperator.bind(this);
    this.handleOperand = this.handleOperand.bind(this);
    this.handleResetForm = this.handleResetForm.bind(this);
    this.initData = this.initData.bind(this);
    this.getData = this.getData.bind(this);
    
    this.initData(props.formData);

    this.clearButton = (
      <Button
        variant="contained"
        color="primary"
        onClick={this.handleResetForm}
        key="clearButton"
      >
        Очистить форму
      </Button>
    );
    this.searchButton = (
      <Button
        variant="contained"
        color="primary"
        onClick={this.getData}
        key="searchButton"
      >
        Найти
      </Button>
    );
    this.selectAllButton = memoize((checked, indeterminate) => (
      <FormControlLabel
        control={
          <Checkbox
            checked={checked}
            indeterminate={indeterminate}
            onChange={this.handleViewAll}
          />
        }
        label="Выбрать все атрибуты"
        key="selectAllButton"
      />
    ));
    this.menuChildren = memoize((elem1, elem2, elem3) => [elem1, elem2, elem3]);
  }
  /**
   * Сохраняет текущее состояние формы поиска перед демонтированием компонента.
   */
  componentWillUnmount() {
    this.props.updateForm(this.state.formData);
  }
  /**
   * Инициализирует массив React-элементов предстовляющих собой форму поиска данных в БД.
   * @param {Array} source - Массив объектов определяющий состояние формы поиска
   * @return {Array} Массив React-элементов
   */
  initData(source) {
    this.tableElements = source.map((item, index) => {
      return [
        <Checkbox
          color="primary"
          checked={item.checked}
          onChange={this.handleView(index)}
        />,
        item.name,
        <MySelect
          value={item.operator}
          onChange={this.handleOperator(index)}
        />,
        <TextField
          value={item.operand}
          onChange={this.handleOperand(index)}
          fullWidth
        />
      ];
    });
  }
  /**
   * Возвращает обработчик события onChange для checkbox'а находящегося в строке с номером index.
   * @param {number} index - Номер строки
   * @return {function} Обработчик события
   */
  handleView(index) {
    return e => {
      this.tableElements[index] = this.tableElements[index].map(item => item);
      this.tableElements[index][0] = (
        <Checkbox
          color="primary"
          checked={e.target.checked}
          onChange={this.handleView(index)}
        />
      );

      let formData = this.state.formData.map(item => item);
      formData[index] = { ...formData[index] };
      formData[index].checked = e.target.checked;

      const isCheckedAll = formData.every(item => item.checked);
      const isCheckedSome =
        !isCheckedAll && formData.some(item => item.checked === true);

      this.setState({
        formData,
        isCheckedAll,
        isCheckedSome
      });
    };
  }
  /**
   * Обработчик события onChange для checkbox'а "выбрать все".
   * @param {Object} e
   */
  handleViewAll(e) {
    for (let i = 0; i < this.tableElements.length; i++) {
      this.tableElements[i] = this.tableElements[i].map(item => item);
      this.tableElements[i][0] = (
        <Checkbox
          color="primary"
          checked={e.target.checked}
          onChange={this.handleView(i)}
        />
      );
    }

    const formData = this.state.formData.map(item => {
      let newItem = { ...item };
      newItem.checked = e.target.checked;
      return newItem;
    });
    const isCheckedAll = e.target.checked;
    const isCheckedSome = false;

    this.setState({
      formData,
      isCheckedAll,
      isCheckedSome
    });
  }
  /**
   * Метод возвращающий обработчик события onChange для select'а находящегося в строке с номером index.
   * @param {number} index - Номер строки
   * @return {function} Обработчик события
   */
  handleOperator(index) {
    return e => {
      this.tableElements[index] = this.tableElements[index].map(item => item);
      this.tableElements[index][2] = (
        <MySelect
          value={+e.target.value}
          onChange={this.handleOperator(index)}
        />
      );

      let formData = this.state.formData.map(item => item);
      formData[index] = { ...formData[index] };
      formData[index].operator = +e.target.value;

      this.setState({ formData });
    };
  }
  /**
   * Метод возвращающий обработчик события onChange для input'а находящегося в строке с номером index.
   * @param {number} index - Номер строки
   * @return {function} Обработчик события
   */
  handleOperand(index) {
    return e => {
      this.tableElements[index] = this.tableElements[index].map(item => item);
      this.tableElements[index][3] = (
        <TextField
          value={e.target.value}
          onChange={this.handleOperand(index)}
          fullWidth
        />
      );

      let formData = this.state.formData.map(item => item);
      formData[index] = { ...formData[index] };
      formData[index].operand = e.target.value;

      this.setState({ formData });
    };
  }
  /**
   * Устанавливает состояние компонента по умолчанию.
   */
  handleResetForm() {
    const formData = this.state.formData.map(item => ({
      name: item.name,
      checked: false,
      operator: 0,
      operand: ""
    }));
    this.initData(formData);

    this.setState({
      formData,
      isCheckedAll: false,
      isCheckedSome: false
    });
  }

  /**
   * Отправляет запрос в БД на осное текущего состояния формы поиска.
   */
  getData() {
    let query = {};
    for (let i = 0; i < this.state.formData.length; i++) {
      if (
        this.state.formData[i].operator > 9 ||
        this.state.formData[i].operand !== "" ||
        this.state.formData[i].checked
      ) {
        query[this.state.formData[i].name] = {
          show: this.state.formData[i].checked,
          operator: this.state.formData[i].operator,
          operand: this.state.formData[i].operand
        };
      }
    }
    
    this.props.getData(
      {
        userName: this.props.userName,
        token: this.props.token,
        query 
      },
      this.props.history
    );
  }
  
  render() {
    const selectAllButton = this.selectAllButton(this.state.isCheckedAll, this.state.isCheckedSome);
    const menuChildren = this.menuChildren(selectAllButton, this.clearButton, this.searchButton);

    return (
      <Fragment>
        <MyTable
          header={this.state.header}
          data={this.tableElements}
          columnWidth={this.state.columnWidth}
          fixHeader={true}
        />
        <BottomMenu>{menuChildren}</BottomMenu>
      </Fragment>
    );
  }
}
/** Проверка типов props */
DataBaseSearch.propTypes = {
  userName: PropTypes.string.isRequired,
  token: PropTypes.number.isRequired,
  formData: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      checked: PropTypes.bool,
      operator: PropTypes.number,
      operand: PropTypes.string
    })
  ).isRequired,
  updateForm: PropTypes.func.isRequired,
  getData: PropTypes.func.isRequired
};
/** Функция описывает какие данные из Redux-store необходимо передать компоненту */
function mapStateToProps(state) {
  return {
    userName: state.loginReducer.userName,
    token: state.loginReducer.token,
    formData: state.dataBaseReducer.formData
  };
}
/** Объект содержит action creators которые компонент будет использовать */
const mapDispatchToProps = {
  updateForm,
  getData
};

export default connect(mapStateToProps, mapDispatchToProps)(DataBaseSearch);
