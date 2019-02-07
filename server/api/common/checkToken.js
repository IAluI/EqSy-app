/**
 * Модуль отвечающий за аутентификацию.
 * @module api/common/checkToken
 */

'use strict';

const db = require("../../db/index");

const err_token = {
  status: "401",
  text: "Токен устарел. Для продолжения работы авторезируйтесь заново"
};
const err_user_group = {
  status: "500",
  text: "Ошибка определения привелегий пользователя"
};
const err_unknown = {
  status: "500",
  text: "Неизвестная ошибка во впремя аутентификации пользователя"
};
/**
 * @param {string} userName
 * @param {number} token
 * @returns {Promise}
 */
module.exports = function checkToken(userName, token) {
  let query = 'SELECT "ID_user_group" FROM "users" WHERE "user_name" = ' + "'" + userName + "' AND " + '"user_token" = ' +
        "'" + token + "'";
  return new Promise(function(resolve, reject) {
    db.one(query)
      .then(userGroup => {
          query = 'SELECT "Доступные атрибуты", "Возможность редактирования" FROM "user_group" WHERE "ID_user_group" = ' +
            "'" + userGroup["ID_user_group"] + "'";
          return db.one(query);
        },
        error => {
          reject(err_token);
        }
      )
      .then(data => {
          const allowAtr = JSON.parse(data["Доступные атрибуты"]);
          const editAllow = !!data["Возможность редактирования"];
          resolve({
            allowAtr,
            editAllow
          });
        },
        error => {
          reject(err_user_group);
        }
      )
      .catch(error => {
        if (error.status) {
          reject(error);
        }
        console.log(error);
        reject(err_unknown);
      });
  });
};