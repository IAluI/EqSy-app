/**
 * Модуль отвечающий за получение списка ОУиЭО ОКОФ по коду или описанию.
 * @module api/getOuieoOkofList
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
 * @param {string} inputData.targetValue - Искомое значение
 * @param {string} inputData.targetType - Атрибут по которому требуется произвести поиск (nputData.targetType === 'code'
 * - "Код ОУиЭО ОКОФ"; nputData.targetType === 'description' - "Описание ОУиЭО ОКОФ")
 * @returns {Promise}
 */
module.exports = function getOuieoOkofList(inputData) {
  const { userName, token, targetValue, targetType } = inputData;
  
  return checkToken(userName, token)
    .then(res => {
      if (res.editAllow) {
        const queryType = targetType === "code" ? '"Код ОУиЭО ОКОФ"' : '"Описание ОУиЭО ОКОФ"';
        let query = 'SELECT "ID_ОКОФ_ОУиЭО", "Код ОУиЭО ОКОФ", "Описание ОУиЭО ОКОФ" FROM "ОУиЭО ОКОФ" WHERE ' +
          queryType + " ~* '" + targetValue + "' ORDER BY " + queryType + " LIMIT 20";
        return db.any(query);
      }
      throw err_permission;
    })
    .then(data => {
      const okofList = data.map(item => ({
          id: item["ID_ОКОФ_ОУиЭО"],
          code: item["Код ОУиЭО ОКОФ"],
          description: item["Описание ОУиЭО ОКОФ"]
        
      }));
      return Promise.resolve(okofList);
    })
    .catch(error => {
      if (error.status) {
        return Promise.reject(error);
      }
      console.log(error);
      return Promise.reject(err_unknown);
    });
};