/**
 * Создает объект базы данных
 * @module db/index
 */

"use strict";

const pgp = require("pg-promise")();
const connection = require("../json/connection.json");

module.exports = pgp(connection);
