/**
 * Компонент отображающий навигационную панель.
 *
 * @module src/components/bottomMenuComponents/NavPanel
 */

"use strict";

import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";

import Paper from "@material-ui/core/Paper";
import IconButton from "@material-ui/core/IconButton";
import TextField from "@material-ui/core/TextField";
import ChevronLeft from "@material-ui/icons/ChevronLeft";
import ChevronRight from "@material-ui/icons/ChevronRight";
import FirstPage from "@material-ui/icons/FirstPage";
import LastPage from "@material-ui/icons/LastPage";
import Forward from "@material-ui/icons/Forward";

/**
 * Функция задающая css-классы.
 * @param {Object} theme - Тема оформления
 * @return {Object} Объект содержащий объекты описывающие css-классы
 */
const styles = theme => ({
  navInput: {
    width: "3.5em",
    verticalAlign: "middle"
  },
  navInputPanel: {
    display: "inline-block",
    paddingLeft: 15,
    borderRadius: "40px"
  },
  hideElem: {
    '@media (max-width:950px)': {
      display: 'none'
    }
  },
  pages: {
    margin: '0.5rem',
    '@media (max-width:740px)': {
      display: 'none'
    }
  }
});
/**
 * @param {number} activePage - Текущая активная страница
 * @param {number} pages - Количество страниц всего
 * @param {function} changePage - Функция обрабатывающая переход на заданную станицу
 * @param {string} targetTable - Таблица бля которой требуется изменить страницу
 * @param {Object} classes
 * @extends Component
 */
class NavPanel extends Component {
  constructor() {
    super();

    this.state = {
      targetPage: ""
    };

    this.firstPage = this.firstPage.bind(this);
    this.prevPage = this.prevPage.bind(this);
    this.nextPage = this.nextPage.bind(this);
    this.lastPage = this.lastPage.bind(this);
    this.changeTargetPage = this.changeTargetPage.bind(this);
    this.goToTargetPage = this.goToTargetPage.bind(this);
    this.onEnter = this.onEnter.bind(this);
    this.changePage = this.changePage.bind(this);
  }

  changePage(targetPage, resetTagretPage) {
    this.props.changePage(targetPage, this.props.targetTable);
    if (resetTagretPage) {
      this.setState({ targetPage: "" });
    }
  }

  firstPage() {
    this.changePage(1);
  }

  prevPage() {
    this.changePage(this.props.activePage - 1);
  }

  nextPage() {
    this.changePage(this.props.activePage + 1);
  }

  lastPage() {
    this.changePage(this.props.pages);
  }

  changeTargetPage(e) {
    let targetPage = e.target.value;
    if (targetPage === "" || (+targetPage && !/\D/.test(targetPage))) {
      this.setState({ targetPage });
    }
  }

  goToTargetPage() {
    if (this.state.targetPage === "" && this.props.activePage !== 1) {
      this.changePage(1, true);
    } else if (+this.state.targetPage > this.props.pages && this.props.activePage !== this.props.pages) {
      this.changePage(this.props.pages, true);
    } else if (
      +this.state.targetPage !== this.props.activePage &&
      this.state.targetPage <= this.props.pages &&
      this.state.targetPage !== ""
    ) {
      this.changePage(+this.state.targetPage, true);
    }
  }

  onEnter(e) {
    if (e.key === "Enter") {
      this.goToTargetPage();
    }
  }

  render() {
    const { classes, activePage, pages } = this.props;
    return (
      <div>
        <IconButton
          disabled={activePage === 1}
          onClick={this.firstPage}
          className={classes.hideElem}
        >
          <FirstPage color="action" />
        </IconButton>
        <IconButton
          disabled={activePage === 1}
          onClick={this.prevPage}
          className={classes.hideElem}
        >
          <ChevronLeft color="action" />
        </IconButton>
        <span className={classes.pages} >
          {activePage + " из " + pages}
        </span>
        <IconButton
          disabled={activePage === pages}
          onClick={this.nextPage}
          className={classes.hideElem}
        >
          <ChevronRight color="action" />
        </IconButton>
        <IconButton
          disabled={activePage === pages}
          onClick={this.lastPage}
          className={classes.hideElem}
        >
          <LastPage color="action" />
        </IconButton>
        <Paper component="span" className={classes.navInputPanel} >
          <TextField
            className={classes.navInput}
            placeholder="№ стр."
            value={this.state.targetPage}
            onChange={this.changeTargetPage}
            onKeyPress={this.onEnter}
          />
          <IconButton onClick={this.goToTargetPage} >
            <Forward color="action" />
          </IconButton>
        </Paper>
      </div>
    );
  }
}
/** Проверка типов props */
NavPanel.propTypes = {
  activePage: PropTypes.number.isRequired,
  pages: PropTypes.number.isRequired,
  changePage: PropTypes.func.isRequired,
  targetTable: PropTypes.string,
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(NavPanel);
