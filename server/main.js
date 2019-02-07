/**
 * Получает из БД объект описывающий структуру базы данных и объект описывающий атрибуты базы данных. Вызывает основное
 * приложение.
 */

"use strict";

const db = require("./db/index");
const appplication = require("./app");

db.one('SELECT * FROM "dbConfig"')
  .then(config => {
    appplication(config["db_struct"], config["atr_conf"]);
  })
  .catch(err => {
    console.log(err);
  });
