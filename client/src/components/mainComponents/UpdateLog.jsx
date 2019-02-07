/**
 * Компонент отображающий лог анализа ведомости.
 *
 * @module src/components/mainComponents/UpdateLog
 */

"use strict";

import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";

const styles = theme => ({
  container: {
    overflow: "auto",
    height: "100%"
  },
  list: {
    marginLeft: 30
  },
  error: {
    color: "red"
  },
  warning: {
    color: "black"
  }
});

function UpdateLog(props) {
  function renderLog(item, index) {
    return (
      <li className={props.classes[item.type]} key={"logElem" + index} >
        {item.text}
      </li>
    );
  }
  return (
    <div className={props.classes.container} >
      <ol className={props.classes.list} >{props.logArr.map(renderLog)}</ol>
    </div>
  );
}
/** Проверка типов props */
UpdateLog.propTypes = {
  logArr: PropTypes.array.isRequired
};

const StyledUpdateLog = withStyles(styles)(UpdateLog);
/** Функция описывает какие данные из Redux-store необходимо передать компоненту */
function mapStateToProps(state) {
  return {
    logArr: state.updateReducer.logArr
  };
}

export default connect(mapStateToProps)(StyledUpdateLog);
