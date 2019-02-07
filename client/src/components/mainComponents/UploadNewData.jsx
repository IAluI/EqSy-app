/**
 * Компонент отображающий страницу содержащую форму для выбора файла и запуска анализа данного файла.
 *
 * @module src/components/mainComponents/UploadNewData
 */

"use strict";

import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";

import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";

import { updateDbData } from "../../actions/updateActions";

const styles = theme => ({
  container: {
    padding: 30
  },
  element: {
    display: "inline-block",
    width: "20em",
    "& > *": {
      margin: 10
    }
  }
});
/**
 * @param (string) userName
 * @param (string) token
 * @param (func) updateDbData - Action creator инициализирующий чтения файла и проведение анализа какие новые данные
 * появились у бухгалтерии, какие данные изменились и записи о каком оборудовании были удалены из базы бухгалтерии
 * в связи с их списанием
 * @extends Component
 */
class UploadNewData extends Component {
  constructor() {
    super();

    this.newDataFile = React.createRef();

    this.newEquipInputHandler = this.newEquipInputHandler.bind(this);
  }

  newEquipInputHandler() {
    this.props.updateDbData(
      this.newDataFile.current.files[0],
      this.props.userName,
      this.props.token,
      this.props.history
    );
  }

  render() {
    const { classes } = this.props;
    return (
      <div className={classes.container} >
        <div className={classes.element} >
          <Typography variant="h6" >
            {"Загрузить данные о текущем парке оборудования"}
          </Typography>
          <input type="file" accept="xls" ref={this.newDataFile} />
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={this.newEquipInputHandler}
          >
            {"Обработать данные"}
          </Button>
        </div>
      </div>
    );
  }
}
/** Проверка типов props */
UploadNewData.propTypes = {
  userName: PropTypes.string.isRequired,
  token: PropTypes.number.isRequired,
  updateDbData: PropTypes.func.isRequired
};

const StyledUploadNewData = withStyles(styles)(UploadNewData);
/** Функция описывает какие данные из Redux-store необходимо передать компоненту */
function mapStateToProps(state) {
  return {
    userName: state.loginReducer.userName,
    token: state.loginReducer.token
  };
}
/** Объект содержит action creators которые компонент будет использовать */
const mapDispatchToProps = {
  updateDbData
};

export default connect(mapStateToProps, mapDispatchToProps)(StyledUploadNewData);
