/**
 * Компонент отображающий сообщение об ошибки.
 *
 * @module src/components/mainComponents/ErrorAlert
 */

"use strict";

import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import Button from "@material-ui/core/Button";

import { unSetError } from "../../actions/errorActions";

/**
 * @param {string} errorText - Текст ошибки
 * @param {function} unSetError - Функция стирающая текст ошибки в источнике данных (errorText = '')
 * @constructor
 */
function ErrorAlert({ errorText, unSetError }) {
  return (
    <Dialog open={!!errorText} onClose={unSetError} >
      <DialogTitle>Ошибка</DialogTitle>
      <DialogContent>
        <DialogContentText>{errorText}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={unSetError} color="primary" >
          Ok
        </Button>
      </DialogActions>
    </Dialog>
  );
}
/** Проверка типов props */
ErrorAlert.propTypes = {
  errorText: PropTypes.string.isRequired,
  unSetError: PropTypes.func.isRequired
};
/** Функция описывает какие данные из Redux-store необходимо передать компоненту */
function mapStateToProps(state) {
  return {
    errorText: state.errorReducer.errorText
  };
}
/** Объект содержит action creators которые компонент будет использовать */
const mapDispatchToProps = {
  unSetError
};

export default connect(mapStateToProps, mapDispatchToProps)(ErrorAlert);
