/**
 * Модуль отвечающий за авторизацию.
 * @module api/signIn
 */

"use strict";

const db = require("../db/index");

const err_nf = {
  status: "404",
  text: "Пользователя с таким именем и/или паролем не существует"
};
const err_unknown = {
  status: "500",
  text: "Неизвестная ошибка во впремя аутентификации пользователя"
};
const err_user_group = {
  status: "500",
  text: "Ошибка определения привелегий пользователя"
};
/**
 * @param {Object} inputData
 * @param {string} inputData.userName
 * @param {string} inputData.userPass
 * @param {Object} transAtr
 * @returns {Promise}
 */
module.exports = function signIn(inputData, transAtr) {
  const { userName, userPass } = inputData;
  
  let query = 'SELECT "user_pass", "ID_user_group" FROM "users" WHERE "user_name" = ' + "'" + userName + "'";
  let new_token;
  let user_group;
  return new Promise(function(resolve, reject) {
    db.one(query)
      .then(data => {
          if (data["user_pass"] === userPass) {
            new_token = Math.floor(Math.random() * 1000000) + 1;
            user_group = data["ID_user_group"];
            query = 'UPDATE "users" SET "user_token" = ' + "'" + new_token + "'" +' WHERE "user_name" = ' + "'" +
              userName + "'";
            return db.none(query);
          }
          reject(err_nf);
        }
      )
      .then(() => {
        query = 'SELECT "Доступные атрибуты", "Возможность редактирования" FROM "user_group" WHERE "ID_user_group" = ' +
          "'" + user_group + "'";
        return db.one(query);
      })
      .then(data => {
        if (data) {
          const result = {
            password: new_token,
            editAllow: !!data["Возможность редактирования"],
            atrList: JSON.parse(data["Доступные атрибуты"]).map(item => transAtr[item]["visibleName"])
          };
          resolve(result);
        }
        reject(err_user_group);
      })
      .catch(error => {
        console.log(error);
        reject(err_unknown);
      });
  });
};