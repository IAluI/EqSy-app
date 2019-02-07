/**
 * Модуль отвечающий за сохранение в БД новых данных полученных в результате анализа ведомости.
 * @module api/addData
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
 * @param {Array[]} inputData.addedData - Массив массивов содержащих данные о добавляемой сущности
 * @param {Array} inputData.addedHeader - Массив содержащий зашифрованные имена атрибутов
 *
 * @returns {Promise}
 */
module.exports = function addData(inputData) {
  const { userName, token, addedData, addedHeader } = inputData;
  
  return checkToken(userName, token)
    .then(res => {
      if (res.editAllow) {
        const header = addedHeader.map(item => transUpdatedAtr[item]).join('", "');
        const data = addedData.map(item => 
          item.map(item => insertValue(item)).join(", ")
        ).join("), (");
        return db.none('INSERT INTO "Оборудование" ("' + header + '") VALUES (' + data + ")");
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
