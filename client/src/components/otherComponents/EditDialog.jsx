/**
 * Компонент отображающий диалог для редактирования данных в БД.
 *
 * @module src/components/otherComponents/EditDialog
 */

"use strict";

import React, { Component } from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";

import Dialog from "@material-ui/core/Dialog";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Button from "@material-ui/core/Button";
import CloseIcon from "@material-ui/icons/Close";
import SaveIcon from "@material-ui/icons/Save";
import TextField from "@material-ui/core/TextField";

/**
 * Функция задающая css-классы.
 * @param {Object} theme - Тема оформления
 * @return {Object} Объект содержащий объекты описывающие css-классы
 */
const styles = theme => ({
  toolbar: {
    justifyContent: "space-between"
  },
  container: {
    marginTop: 56,
    padding: 20,
    height: "calc(100% - 56px)",
    overflow: "auto",
    "@media (min-width:600px)": {
      marginTop: 64,
      height: "calc(100% - 64px)"
    }
  },
  inputLabel: {
    color: "black"
  }
});
/**
 * @param {boolean} isOpen
 * @param {function} onClose
 * @param {function} onSave
 * @param {Object} editableAtr - Объект определяющий доступные для редактирования атрибуты
 * @param {Array} data - Массив значений атрибутов редактируемой сущности
 * @param {Array} header - Массив видимых пользователем названий атрибутов 
 * @param {number} rowIndex - Индекс редактируемой сущности в массиве хранящимся в redux store
 * @param {number} primaryKey - Индекс автрибута первичного ключа
 * @param {Object} userData - Объект содержащий имя пользователя и пароль 
 * @extends Component
 */
class EidtDialog extends Component {
  constructor() {
    super();

    this.inputs = {};

    this.renderData = this.renderData.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.convertToString = this.convertToString.bind(this);
    this.initInputs = this.initInputs.bind(this);
  }

  initInputs() {
    this.props.header.forEach((item, index) => {
      if (item in this.props.editableAtr) {
        this.inputs[item] = this.convertToString(this.props.data[index]);
      }
    });
  }

  convertToString(val) {
    if (val === null) {
      return "";
    }
    if (typeof val === "boolean") {
      return (+val).toString();
    }
    return "" + val;
  }

  renderData(item, index) {
    return (
      <TextField
        label={this.props.header[index]}
        InputLabelProps={{
            classes: {
              root: this.props.classes.inputLabel
            },
            shrink: true
          }}
        variant="outlined"
        margin="normal"
        fullWidth={true}
        disabled={!(this.props.header[index] in this.props.editableAtr)}
        defaultValue={this.convertToString(item)}
        name={this.props.header[index]}
        onChange={this.handleInputChange}
        key={'dialogInput' + index}
      />        
    );
  }

  handleInputChange(e) {
    this.inputs[e.target.name] = e.target.value;
  }

  handleSubmit() {
    let newVal;
    let newRow = this.props.header.map((item, index) => {
      if (item in this.inputs) {
        newVal = this.inputs[item].replace(/^\s*(.*?)\s*$/g, "$1");
        this.inputs[item] = newVal ? newVal : null;
        if (this.convertToString(this.props.data[index]) === newVal) {
          return this.props.data[index];
        }
        return this.inputs[item];
      }
      return this.props.data[index];
    });
    this.props.onSave(
      this.props.rowIndex,
      newRow,
      this.inputs,
      this.props.data[this.props.primaryKey],
      this.props.onClose,
      this.props.userData
    );
  }

  render() {
    const { classes, isOpen, onClose, data } = this.props;

    return (
      <Dialog
        fullScreen
        open={isOpen}
        onClose={this.props.onClose}
        onEnter={this.initInputs}
      >
        <AppBar>
          <Toolbar
            classes={{
              root: classes.toolbar
            }}
          >
            <Button
              onClick={onClose}
              variant="contained"
              color="primary"
            >
              <CloseIcon />
              {"Закрыть"}
            </Button>
            <Button
              onClick={this.handleSubmit}
              variant="contained"
              color="primary"
            >
              <SaveIcon />
              {"Сохранить"}
            </Button>
          </Toolbar>
        </AppBar>
        <div className={classes.container} >
          {data.map(this.renderData)}
        </div>
      </Dialog>
    );
  }
}
/** Проверка типов props */
EidtDialog.propTypes = {
  classes: PropTypes.object.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  editableAtr: PropTypes.objectOf(PropTypes.bool).isRequired,
  data: PropTypes.array.isRequired,
  header: PropTypes.array.isRequired,
  rowIndex: PropTypes.number.isRequired,
  primaryKey: PropTypes.number.isRequired,
  userData: PropTypes.shape({
    userName: PropTypes.string,
    token: PropTypes.number
  }).isRequired
};

export default withStyles(styles)(EidtDialog);
