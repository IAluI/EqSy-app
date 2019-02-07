/**
 * Компонент отображающий страницу логина.
 *
 * @module src/components/mainComponents/Login
 */

"use strict";

import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { withStyles } from "@material-ui/core/styles";

import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";

import { signIn } from "../../actions/loginActions";

const styles = theme => ({
  rootContainer: {
    width: "25em",
    margin: "auto"
  },
  logo: {
    display: "block",
    width: "123px",
    height: "136px",
    background: "url(./img/header_logo.png) 50% no-repeat",
    margin: "auto",
    marginTop: "2em"
  },
  title: {
    fontWeight: 700,
    textAlign: "center",
    marginTop: "1em",
    marginBottom: "1em"
  },
  formContainer: {
    textAlign: "center",
    padding: "2em"
  },
  submitButton: {
    marginTop: "2em"
  }
});

class Login extends Component {
  constructor() {
    super();
    
    this.userData = {
      userVal: "",
      passVal: ""
    };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleFormSubmit = this.handleFormSubmit.bind(this);
  }
  
  handleInputChange(e) {
    this.userData[e.target.name] = e.target.value;
  }
  
  handleFormSubmit(e) {
    e.preventDefault();
    this.props.signIn(this.userData.userVal, this.userData.passVal, this.props.history);
    this.userData = {
      userVal: "",
      passVal: ""
    };
  }
  
  render() {
    const { classes } = this.props;

    return (
      <div className={classes.rootContainer}>
        <a
          href="http://www.asu.ru/"
          target="_blank"
          rel="noreferrer noopener"
          className={classes.logo}
        />
        <Typography variant="h5" className={classes.title}>
          Добро пожаловать в систему "Учет оборудования"
        </Typography>
        <Paper className={classes.formContainer} elevation={5}>
          <form onSubmit={this.handleFormSubmit}>
            <TextField
              label="Имя пользователя"
              placeholder="Введите имя пользователя"
              variant="outlined"
              margin="normal"
              fullWidth={true}
              InputLabelProps={{ shrink: true }}
              name="userVal"
              onChange={this.handleInputChange}
            />
            <br />
            <TextField
              label="Пароль"
              placeholder="Введите пароль"
              type="password"
              variant="outlined"
              margin="normal"
              fullWidth={true}
              InputLabelProps={{ shrink: true }}
              name="passVal"
              onChange={this.handleInputChange}
            />
            <br />
            <Button
              variant="contained"
              color="primary"
              size="large"
              className={classes.submitButton}
              type="submit"
            >
              Войти
            </Button>
          </form>
        </Paper>
      </div>
    );
  }
}
/** Проверка типов props */
Login.propTypes = {
  classes: PropTypes.object,
  signIn: PropTypes.func.isRequired
};

const StyledLogin = withStyles(styles)(Login);
/** Объект содержит action creators которые компонент будет использовать */
const mapDispatchToProps = {
  signIn
};

export default connect(null, mapDispatchToProps)(StyledLogin);
