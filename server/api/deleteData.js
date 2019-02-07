/**
 * Модуль отвечающий за обновление данных в БД о списании оборудования.
 * @module api/deleteData
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
 * @param {Object} inputData.invNumToDelete - Массив первичных ключей соответсвующих списанному оборудованию.
 * 
 * @returns {Promise}
 */
module.exports = function deleteData(inputData) {
  const { userName, token, invNumToDelete } = inputData;

  return checkToken(userName, token)
    .then(res => {
      if (res.editAllow) {
        const curDate = new Date();

        return db.tx(t => {
          return t
            .one(
              'INSERT INTO "Списания" ("Дата списания") VALUES ($1) RETURNING "Списание_ID"',
              curDate.getFullYear() + "." + (curDate.getMonth() + 1) + "." + curDate.getDate()
            )
            .then(data => {
              return t.none(
                'UPDATE "Оборудование" SET "Списание_ID" = ' + "'" + data["Списание_ID"] + "'" + ' WHERE "Инвентарный номер" IN ($1:csv)',
                [invNumToDelete]
              );
            });
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