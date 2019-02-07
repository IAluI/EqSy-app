/**
 * Компоенет определяющий общий вид нижнего меню
 *
 * @module src/components/bottomMenuComponents/BottomMenu
 */

"use strict";

import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";

import Paper from "@material-ui/core/Paper";

/**
 * Функция задающая css-классы.
 * @param {Object} theme - Тема оформления
 * @return {Object} Объект содержащий объекты описывающие css-классы
 */
const styles = theme => ({
  bottomMenu: {
    position: "fixed",
    bottom: 0,
    height: "60px",
    width: "inherit",
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
    overflow: "auto"
  }
});
/**
 * Класс описывающий компонент MenuItem предаставляющий обертку для элементов нижниго меню.
 * @param {func} children
 * @extends PureComponent
 */
class MenuItem extends PureComponent {
  render() {
    return <div>{this.props.children}</div>;
  }
}
/** Проверка типов props */
MenuItem.propTypes = {
  children: PropTypes.element.isRequired
};
/**
 * Класс описывающий компонент BottomMenu определяющий общий вид нижнего меню. *
 * @param {object} classes
 * @param {Array} children
 * @extends PureComponent
 */
class BottomMenu extends PureComponent {
  render() {
    const { classes, children } = this.props;
    return (
      <Paper square elevation={3} className={classes.bottomMenu}>
        {children.map((item, index) => {
          return <MenuItem key={"bottomMenu" + index}>{item}</MenuItem>;
        })}
      </Paper>
    );
  }
}
/** Проверка типов props */
BottomMenu.propTypes = {
  classes: PropTypes.object.isRequired,
  children: PropTypes.arrayOf(PropTypes.element)
};

export default withStyles(styles)(BottomMenu);
