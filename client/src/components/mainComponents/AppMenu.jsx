/**
 * Компонент отображающий главное меню приложения.
 *
 * @module src/components/mainComponents/AppMenu
 */


"use strict";

import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";

import Paper from "@material-ui/core/Paper";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import ChevronLeft from "@material-ui/icons/ChevronLeft";
import ChevronRight from "@material-ui/icons/ChevronRight";
import Button from "@material-ui/core/Button";
import Collapse from "@material-ui/core/Collapse";

import { MENU_WIDTH } from "../../constants";

import { setInitialState } from "../../actions/loginActions";

const styles = theme => ({
  navContainer: {
    position: "absolute",
    height: "100%",
    width: MENU_WIDTH,
    zIndex: 1,
    transition: "all 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms"
  },
  navWarper: {
    overflow: "auto",
    height: "100%"
  },
  navTextLevel1: {
    fontWeight: 500
  },
  navLevel2: {
    paddingLeft: "44px"
  },
  link: {
    position: "absolute",
    left: 0,
    top: 0,
    width: "100%",
    height: "100%"
  },
  appContainer: {
    marginLeft: "240px"
  },
  hideMenuButton: {
    height: "64px",
    position: "absolute",
    top: "50%",
    transform: "translate(0, -50%)",
    right: "-24px",
    padding: 0,
    minWidth: 0,
    borderRadius: "0 5px 5px 0"
  }
});
/** 
 * @param (Object) props
 * @param {Object} props.state - Объект состояния компонента передоаваемый из родительского компонента
 * @param (function) props.handleMenuButtonClick - Обработчик открытия подменю
 * @param (function) props.handleExit - Обработчик выхода из прилодения
 * @param (Object[]) props.menuStuct - Массив объектов хранящих информацию о названии и адресах страниц приложения
 * @param (string) props.pathname - Текущий URL
 * @param (boolean) props.hideMenu - Флаг открыто ли меню
 * @param (function) props.handleHideMenu - Обработчик открытия/закрытия меню
 * @param (Object) props.classes
 * @constructor
 */
function NavMenu({
  state,
  handleMenuButtonClick,
  handleExit,
  menuStuct,
  pathname,
  hideMenu,
  handleHideMenu,
  classes
}) {
  const renderSubMenu = (item, index, arr) => (
    <ListItem
      className={classes.navLevel2}
      key={"subMenuEl" + index}
      button
      component="li"
      selected={pathname === item.elementPath}
    >
      <ListItemText primary={item.elementName} />
      <Link to={item.elementPath} className={classes.link} />
    </ListItem>
  );

  const renderMenu = (item, index) => {
    if (state["menuIsOpen" + index] === undefined) return null;

    return (
      <React.Fragment key={"menuButton" + index}>
        <ListItem button component="li" onClick={handleMenuButtonClick(index)}>
          <ListItemText
            primary={item.subMenuName}
            primaryTypographyProps={{ className: classes.navTextLevel1 }}
          />
          <ListItemIcon>
            {state["menuIsOpen" + index] ? (
              <ExpandLessIcon />
            ) : (
              <ExpandMoreIcon />
            )}
          </ListItemIcon>
        </ListItem>
        <Collapse in={state["menuIsOpen" + index]}>
          <List>{item.subMenuElements.map(renderSubMenu)}</List>
        </Collapse>
      </React.Fragment>
    );
  };

  return (
    <Paper
      square
      elevation={5}
      className={classes.navContainer}
      style={hideMenu ? { left: "-" + MENU_WIDTH } : { left: 0 }}
    >
      <div className={classes.navWarper}>
        <nav>
          <List>
            {menuStuct.map(renderMenu)}
            <ListItem button component="li" onClick={handleExit}>
              <ListItemText
                primary={"Выйти"}
                primaryTypographyProps={{ className: classes.navTextLevel1 }}
              />
            </ListItem>
          </List>
        </nav>
        <Button
          variant="contained"
          color="primary"
          onClick={handleHideMenu}
          className={classes.hideMenuButton}
        >
          {hideMenu ? <ChevronRight /> : <ChevronLeft />}
        </Button>
      </div>
    </Paper>
  );
}
NavMenu.propTypes = {
  state: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
  menuStuct: PropTypes.arrayOf(PropTypes.object).isRequired,
  pathname: PropTypes.string.isRequired,
  hideMenu: PropTypes.bool.isRequired,
  handleMenuButtonClick: PropTypes.func.isRequired,
  handleExit: PropTypes.func.isRequired,
  handleHideMenu: PropTypes.func.isRequired
};
const StyledNavMenu = withStyles(styles)(NavMenu);
/**
 * @param (boolean) editAllow - Имеет ли пользователь право редактировать БД
 * @param (Object[]) navMenu - Массив объектов хранящих информацию о названии и адресах страниц приложения
 * @param (function) setInitialState - Функция сбрасывающая состояние приложения к начальному
 */
class NavMenuContainer extends React.Component {
  constructor(props) {
    super();

    let initialState = {};
    props.navMenu.forEach((item, index) => {
      if (props.editAllow || item.showAll) {
        initialState["menuIsOpen" + index] = item.defaultOpen;
      }
    });
    initialState["hideMenu"] = false;
    this.state = initialState;

    this.handleMenuButtonClick = this.handleMenuButtonClick.bind(this);
    this.handleExit = this.handleExit.bind(this);
    this.handleHideMenu = this.handleHideMenu.bind(this);
  }

  handleMenuButtonClick(index) {
    return () => {
      this.setState({
        ["menuIsOpen" + index]: !this.state["menuIsOpen" + index]
      });
    };
  }

  handleExit() {
    this.props.history.push("/");
    this.props.setInitialState();
  }

  handleHideMenu() {
    this.setState({ hideMenu: !this.state.hideMenu });
  }

  render() {
    const mwStyle = {
      position: "absolute",
      height: "100%",
      transition: "all 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms",
      left: this.state.hideMenu ? 0 : MENU_WIDTH,
      width: this.state.hideMenu ? "100%" : "calc(100% - " + MENU_WIDTH + ")"
    };

    return (
      <React.Fragment>
        <StyledNavMenu
          state={this.state}
          handleMenuButtonClick={this.handleMenuButtonClick}
          handleExit={this.handleExit}
          menuStuct={this.props.navMenu}
          pathname={this.props.history.location.pathname}
          hideMenu={this.state.hideMenu}
          handleHideMenu={this.handleHideMenu}
        />
        <div style={mwStyle} >{this.props.children}</div>
      </React.Fragment>
    );
  }
}
NavMenuContainer.propTypes = {
  editAllow: PropTypes.bool.isRequired,
  setInitialState: PropTypes.func.isRequired,
  navMenu: PropTypes.arrayOf(PropTypes.object).isRequired
};
/** Функция описывает какие данные из Redux-store необходимо передать компоненту */
function mapStateToProps(state) {
  return {
    editAllow: state.loginReducer.editAllow
  };
}
/** Объект содержит action creators которые компонент будет использовать */
const mapDispatchToProps = {
    setInitialState
};

export default connect(mapStateToProps, mapDispatchToProps)(NavMenuContainer);
