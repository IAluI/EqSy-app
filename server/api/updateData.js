/**
 * Модуль отвечающий за внесение изменений в БД обнаруженных в результате анализа ведомости.
 * @module api/updateData
 */

"use strict";

const db = require("../db/index");

const checkToken = require("./common/checkToken");
const insertValue = require("./common/insertValue");

const transUpdatedAtr = require("../json/transUpdatedAtr.json");

const err_unknown = { status: "500", text: "Неизвестная ошибка сервера" };
const err_permission = { status: "403", text: "Forbidden" };
/**
 * @param {Object} inputData
 * @param {string} inputData.userName
 * @param {number} inputData.token
 * @param {Object} inputData.updatedData - Объект содержащий информацию о измененных данных ключами которого являются
 * первичные ключи главной таблицы
 * @param {Object} inputData.updatedData.primaryKey - Объект содержащий измененные данные для сущности с первичным 
 * ключом primaryKey
 * @param {?string|number|boolean} inputData.updatedData.primaryKey.atrName - Новое значение атрибута atrName
 *
 * @returns {Promise}
 */
module.exports = function updateData(inputData) {
  const { userName, token, updatedData } = inputData;

  return checkToken(userName, token)
    .then(res => {
      if (res.editAllow) {
        return db.tx(t => {
          let queries = [], newData;
          for (let key in updatedData) {
            newData = [];
            for (let updAtr in updatedData[key]) {
              newData.push('"' + transUpdatedAtr[updAtr] + '" = ' + insertValue(updatedData[key][updAtr]));
            }
            queries.push(
              t.none('UPDATE "Оборудование" SET ' + newData.join(", ") + ' WHERE "Инвентарный номер" = ' + "'" + key + "'")
            );
          }
          return t.batch(queries);
        });
      }
      throw err_permission;
    })
    .catch(error => {
      if (error.status) {
        return Promise.reject(error);
      }
      console.log(error);
      return Promise.reject(err_unknown);
    });
};