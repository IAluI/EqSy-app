/**
 * Компонент оборажающий, что приложение занято ресурсоемкой операцией или ожидает ответа сервера.
 * 
 * @module src/components/mainComponents/Progress
 */

"use strict";

import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { withStyles } from "@material-ui/core/styles";

import LinearProgress from "@material-ui/core/LinearProgress";
import Collapse from "@material-ui/core/Collapse";

const styles = theme => ({
  container: {
    position: "fixed",
    width: "100%",
    top: 0,
    zIndex: theme.zIndex.tooltip
  }
});

function Progress({ inProgress, classes }) {
  return (
    <Collapse
      in={inProgress}
      timeout={500}
      classes={{
        container: classes.container
      }}
    >
      <LinearProgress color="secondary" />
    </Collapse>
  );
}
/** Проверка типов props */
Progress.propTypes = {
  inProgress: PropTypes.bool.isRequired
};
/** Функция описывает какие данные из Redux-store необходимо передать компоненту */
function mapStateToProps(state) {
  return {
    inProgress: state.progressReducer.inProgress
  };
}
  
export default connect(mapStateToProps)(withStyles(styles)(Progress));
