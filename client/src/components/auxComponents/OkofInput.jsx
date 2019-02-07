/**
 * Компонент отображающий input для выбора для текущей строки таблицы одного из из имеющихся в БД значений ОУиЭО ОКОФ.
 *
 * @module src/components/auxComponents/OkofInput
 */

"use strict";

import React, { Component } from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";

import Downshift from "downshift";

import TextField from "@material-ui/core/TextField";
import Paper from "@material-ui/core/Paper";
import MenuItem from "@material-ui/core/MenuItem";
import LinearProgress from "@material-ui/core/LinearProgress";

/**
 * Функция задающая css-классы.
 * @param {object} theme - Тема оформления
 * @return {object} Объект содержащий объекты описывающие css-классы
 */
const styles = theme => ({
  container: {
    position: "relative"
  },
  menuList: {
    position: "absolute",
    zIndex: 1,
    left: 0,
    width: "30rem",
    maxHeight: "20rem",
    overflow: "auto"
  },
  menuDerection: {
    bottom: "100%"
  },
  menuItemRoot: {
    whiteSpace: "normal",
    height: "auto",
    wordWrap: "break-word"
  }
});
/**
 * @param {string} pKey - Значение первичного ключа соответсвующего текущей строке таблицы
 * @param {Object} ouieoOkof - Объект хранящий информацию о id, коде и описании ОУиЭО ОКОФ. Ключами данного объекта
 * являются значение первичных ключей pKey
 * @param {string} inputType - Тип input'а определяющий по коду или по описанию будет производится поиск ОКОФ в БД
 * @param {function} selectOkof - Функция обрабатывающая выбор ОКОФ
 * @param {function} setError - Функция вызывающая сообщение об ошибке
 * @param {number} maxRow - Максимальное количество строк на странице
 * @param {string} url - Адрес сервера
 * @param {Object} userData - Объект содержащий имя пользователя и пароль
 * @param {Object} classes
 * @extends Component
 */
class OkofInput extends Component {
  constructor() {
    super();

    this.state = {
      okofList: [],
      loading: false,
      isFocused: false
    };

    this.downshiftStateChange = this.downshiftStateChange.bind(this);
    this.inputChange = this.inputChange.bind(this);
    this.renderInput = this.renderInput.bind(this);
    this.getOkofList = debounce(this.getOkofList.bind(this), 1200);
    this.selectOkof = this.selectOkof.bind(this);
    this.renderOkofList = this.renderOkofList.bind(this);
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (
      this.state.okofList !== nextState.okofList ||
      this.props.pKey !== nextProps.pKey ||
      this.props.ouieoOkof[this.props.pKey].id !== nextProps.ouieoOkof[nextProps.pKey].id
    );
  }

  downshiftStateChange(changes) {
    if (changes.hasOwnProperty("inputValue") && changes.inputValue !== "" && !changes.hasOwnProperty("selectedItem")) {
      this.setState({ loading: true });
      this.getOkofList(changes.inputValue);
    }
  }

  inputChange(e) {
    if (e.target.value !== "" && this.state.isFocused) {
      this.setState({ loading: true });
      this.getOkofList(e.target.value);
    }
  }

  getOkofList(targetValue) {
    const { inputType, userData } = this.props;

    fetch(this.props.url + "api/getOuieoOkofList", {
      method: "POST",
      body: JSON.stringify({
        userName: userData.userName,
        token: userData.token,
        targetValue,
        targetType: inputType
      }),
      headers: {
        "Content-Type": "application/json"
      }
    })
      .then(response => {
        if (!response.ok) {
          return response.text();
        }
        return response.json();
      })
      .then(result => {
        if (typeof result === "string") {
          this.props.setError(result);
        }
        this.setState({
          okofList: result,
          loading: false
        });
      });
  }

  selectOkof(selectedItem) {
    this.props.selectOkof(this.props.pKey, selectedItem);
  }

  renderInput(inputProps) {
    const { InputProps, ref, ...other } = inputProps;

    return (
      <TextField
        InputProps={{
          inputRef: ref,
          ...InputProps
        }}
        {...other}
      />
    );
  }

  renderOkofList({ item, index, itemProps, highlightedIndex, selectedItem, inputType }) {
    const isHighlighted = highlightedIndex === index;
    const isSelected = selectedItem && selectedItem[inputType] === item[inputType];

    return (
      <MenuItem
        {...itemProps}
        key={item[inputType]}
        selected={isHighlighted}
        component="div"
        style={{
          fontWeight: isSelected ? 500 : 400,
          color: item.code.indexOf("x") !== -1 ? "red" : "black"
        }}
      >
        {item[inputType]}
      </MenuItem>
    );
  }

  render() {
    const { classes, pKey, rowIndex, maxRow, ouieoOkof, inputType } = this.props;

    return (
      <Downshift
        onSelect={this.selectOkof}
        itemToString={item => (item == null ? "" : item[inputType])}
        selectedItem={ouieoOkof[pKey]}
      >
        {({
          getInputProps,
          getItemProps,
          getMenuProps,
          highlightedIndex,
          inputValue,
          isOpen,
          selectedItem
        }) => (
          <div className={classes.container} >
            {this.renderInput({
              fullWidth: true,
              multiline: true,
              rowsMax: 4,
              type: "search",
              autoComplete: "off",
              name: inputType + pKey,
              InputProps: getInputProps({
                onFocus: () => {
                  this.setState({ isFocused: true });
                },
                onBlur: () => {
                  this.setState({ isFocused: false });
                },
                onChange: this.inputChange
              })
            })}
            <div {...getMenuProps()} >
              {this.state.loading ? <LinearProgress color="secondary" variant="query" /> : null}
              {isOpen ? (
                <Paper
                  className={classes.menuList + (rowIndex / maxRow > 0.33 ? " " + classes.menuDerection : "")}
                  square
                >
                  {this.state.okofList.map((item, index) =>
                    this.renderOkofList({
                      item,
                      index,
                      itemProps: getItemProps({
                        item: item,
                        classes: {
                          root: classes.menuItemRoot
                        }
                      }),
                      highlightedIndex,
                      selectedItem,
                      inputType
                    })
                  )}
                </Paper>
              ) : null}
            </div>
          </div>
        )}
      </Downshift>
    );
  }
}
/** Проверка типов props */
OkofInput.propTypes = {
  classes: PropTypes.object.isRequired,
  pKey: PropTypes.string.isRequired,
  ouieoOkof: PropTypes.objectOf(PropTypes.object).isRequired,
  inputType: PropTypes.string.isRequired,
  selectOkof: PropTypes.func.isRequired,
  setError: PropTypes.func.isRequired,
  maxRow: PropTypes.number.isRequired,
  url: PropTypes.string.isRequired,
  userData: PropTypes.shape({
    userName: PropTypes.string,
    token: PropTypes.number
  }).isRequired
};

export default withStyles(styles)(OkofInput);

function debounce(f, ms) {
  let timer = null;
  return function(...args) {
    const onComplete = () => {
      f.apply(this, args);
      timer = null;
    };
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(onComplete, ms);
  };
}