/**
 * Модуль отвечающий за получение данных необходимых для анализа ведомости и определения какие данные был добавленны,
 * уделены и обновлены.
 * @module api/getDataForCompare
 */

"use strict";

const db = require("../db/index");

const checkToken = require("./common/checkToken");

const err_unknown = { status: "500", text: "Неизвестная ошибка сервера" };
const err_permission = { status: "403", text: "Forbidden" };
/**
 * @param {Object} inputData
 * @param {string} inputData.userName
 * @param {number} inputData.token
 * @returns {Promise}
 */
module.exports = function getDataForCompare(inputData) {
  const { userName, token } = inputData;
  
  let query = 'SELECT "Наименование", "Инвентарный номер", "Год ввода в эксплуатацию", "Стоимость", "Количество", "ID_Мат_ответств", "ID_ОКОФ_новый", "ID_ОКОФ_старый" FROM "Оборудование" WHERE "Списание_ID" IS NULL';
  return checkToken(userName, token)
    .then(res => {
      if (res.editAllow) {
        return db.many(query);  
      }
      throw err_permission;
    })
    .then(data => {
      let dataForCompare = {};
      for (let i = 0; i < data.length; i++) {
        dataForCompare[data[i]["Инвентарный номер"]] = {
          curName: data[i]["Наименование"],
          curDate: data[i]["Год ввода в эксплуатацию"],
          curWorth: data[i]["Стоимость"],
          curNumber: data[i]["Количество"],
          newOkofKey: data[i]["ID_ОКОФ_новый"],
          oldOkofKey: data[i]["ID_ОКОФ_старый"],
          molKey: data[i]["ID_Мат_ответств"]
        };
      }
      return Promise.resolve(dataForCompare);
    })
    .catch(error => {
      if (error.status) {
        return Promise.reject(error);
      }
      console.log(error);
      return Promise.reject(err_unknown);
    });
};
