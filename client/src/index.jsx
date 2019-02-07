/**
 * Инициализирует и подключает Redux-store. Инициализирует и подключает mui-тему. Задается роутинг приложения и
 * стуктура основного меню
 *
 * @module src/index
 */

"use strict";

import React from "react";
import { render } from "react-dom";

import { Provider } from "react-redux";
import configureStore from "./configureStore";

import { MuiThemeProvider, createMuiTheme } from "@material-ui/core/styles";

import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import ErrorAlert from "./components/mainComponents/ErrorAlert";
import Login from "./components/mainComponents/Login";
import AppMenu from "./components/mainComponents/AppMenu";
import DataBaseSearch from "./components/mainComponents/DataBaseSearch";
import DataBaseData from "./components/mainComponents/DataBaseData";
import UploadNewData from "./components/mainComponents/UploadNewData";
import UpdateLog from "./components/mainComponents/UpdateLog";
import UpdateAdded from "./components/mainComponents/UpdateAdded";
import UpdateUpdated from "./components/mainComponents/UpdateUpdated";
import UpdateDeleted from "./components/mainComponents/UpdateDeleted";
import Progress from "./components/mainComponents/Progress";

/** Задаем тему оформления */
const theme = createMuiTheme({
  typography: {
    useNextVariants: true
  },
  palette: {
    primary: {
      light: "#62efff",
      main: "#00bcd4",
      dark: "#008ba3",
      contrastText: "#fff"
    },
    secondary: {
      light: "#ff5983",
      main: "#f50057",
      dark: "#bb002f",
      contrastText: "#fff"
    }
  }
});
/** Инициализируем хранилище redux */
const store = configureStore();
/** Задаем массив описывающий структуру главного меню приложения */
const navMenu = [
  {
    subMenuName: "База данных",
    defaultOpen: true,
    showAll: true,
    subMenuElements: [
      { elementName: "Поиск", elementPath: "/app/db/search" },
      { elementName: "Данные", elementPath: "/app/db/data" }
    ]
  },
  {
    subMenuName: "Обновить базу по ведомости",
    defaultOpen: false,
    showAll: false,
    subMenuElements: [
      {
        elementName: "Загрузить данные",
        elementPath: "/app/update/upload_data"
      },
      {
        elementName: "Новое оборудование",
        elementPath: "/app/update/new_equip"
      },
      {
        elementName: "Обновленные данные",
        elementPath: "/app/update/updated_equip"
      },
      {
        elementName: "Не найденное оборудование (списаное)",
        elementPath: "/app/update/deleted_equip"
      },
      //{elementName: "Новые данные о серийных номерах", elementPath: "/app/update/new_ser"},
      { elementName: "Отчет", elementPath: "/app/update/report" }
    ]
  }
];
/** Задаем массив сопоставляющий путь с соответсующим ему компонентом */
const componentPath = [
  { path: "/app/db/search", component: DataBaseSearch },
  { path: "/app/db/data", component: DataBaseData },
  { path: "/app/update/upload_data", component: UploadNewData },
  { path: "/app/update/new_equip", component: UpdateAdded },
  { path: "/app/update/deleted_equip", component: UpdateDeleted },
  { path: "/app/update/updated_equip", component: UpdateUpdated },
  { path: "/app/update/report", component: UpdateLog }
];

render(
  <Provider store={store}>
    <MuiThemeProvider theme={theme}>
      <Router>
        <React.Fragment>
          <Route path="/" component={ErrorAlert} />
          <Route path="/" component={Progress} />
          <Route exact path="/" component={Login} />
          <Route
            path="/app"
            render={props => (
              <AppMenu navMenu={navMenu} {...props}>
                <Switch>
                  {componentPath.map((item, index) => (
                    <Route
                      path={item.path}
                      component={item.component}
                      key={"appPath" + index}
                    />
                  ))}
                </Switch>
              </AppMenu>
            )}
          />
        </React.Fragment>
      </Router>
    </MuiThemeProvider>
  </Provider>,
  document.getElementById("root")
);
