/**
 * Модуль отвечающий за получение значений первичных ключей по данным для таблиц хранящих данные о МОЛ, новом и старом
 * ОКОФ.  
 * @module api/getRefKey
 */

"use strict";

const db = require("../db/index");

const checkToken = require("./common/checkToken");

const err_unknown = { status: "500", text: "Неизвестная ошибка сервера" };
const err_permission = { status: "403", text: "Forbidden" };
/**
 * Производит выборку первичных ключей по данным для таблиц содержащих данные о МОЛ, новом и старом ОКОФ. Возвращает
 * объект сожержащий массивы вида [{атрибут_1: значение_1, ..., атрибут_n: значение_n}, ...]
 * @param {Object} inputData
 * @param {string} inputData.userName
 * @param {number} inputData.token
 * @param {Array} inputData.newOkofList - Массив содержащий коды нового ОКОФ для которых требуется определить 
 * значение первичного ключа.
 * @param {Array} inputData.oldOkofList - Массив содержащий коды старого ОКОФ для которых требуется определить 
 * значения первичного ключа.
 * @param {Array} inputData.molList - Массив содержащий ФИО МОЛ для которых требуется определить значение первичного
 * ключа
 * 
 * @returns {Promise}
 */
module.exports = function getRefKey(inputData) {
  const { userName, token, newOkofList, oldOkofList, molList } = inputData;
  
  let molRefKey;

  let molFullName = molList.map(item => item.split(" "));
  let curMolSurname = molFullName.map(val => val[0]);
  let curMolName = molFullName.map(val => val[1] + " " + val[2]);

  let query = 'SELECT "ID_Мат_ответств", "Фамилия МОЛ", "Имя Отчество МОЛ" FROM "Материально ответственное лицо" WHERE "Фамилия МОЛ" IN ($1:raw) AND "Имя Отчество МОЛ" IN ($2:raw)';
  return checkToken(userName, token)
    .then(res => {
      if (res.editAllow) {
        return db.any(query, ["'" + curMolSurname.join("','") + "'", "'" + curMolName.join("','") + "'"]);
      }
      throw err_permission;
    })
    .then(data => {
      let newMol = [];
      molRefKey = data;

      molList.forEach(molFromFile => {
        const cond = data.some(molFromDb => {
          return molFromDb["Фамилия МОЛ"] + " " + molFromDb["Имя Отчество МОЛ"] === molFromFile;
        });
        if (!cond) {
          const fullName = molFromFile.split(" ");
          newMol.push([fullName[0], fullName[1] + " " + fullName[2]]);
        }
      });
      if (newMol.length !== 0) {
        query = 'INSERT INTO "Материально ответственное лицо" ("Фамилия МОЛ", "Имя Отчество МОЛ") VALUES(' +
          newMol.map(item => "'" + item.join("', '") + "'").join("), (") +
          ') RETURNING "ID_Мат_ответств", "Фамилия МОЛ", "Имя Отчество МОЛ"';
        return db.many(query);
      }
      return [];
    })
    .then(data => {
      molRefKey.push(...data);
      
      let requests = [];
      /** Если список пуст запрашиваем заведомо отсутсвующее значение "empty"*/
      requests.push({
        query:
          'SELECT "ID_ОКОФ_новый", "Код новый ОКОФ" FROM "Новый ОКОФ" WHERE "Код новый ОКОФ" IN ($1:csv)',
        data: !newOkofList.length?["empty"]:newOkofList
      });
      requests.push({
        query:
          'SELECT "ID_ОКОФ_старый", "Код старый ОКОФ" FROM "Старый ОКОФ" WHERE "Код старый ОКОФ" IN ($1:csv)',
        data: !oldOkofList.length?["empty"]:oldOkofList
      });
      return db.tx(t => {
        return t.batch(requests.map(item => t.any(item.query, [item.data])));
      });
    })
    .then(data => {
      return Promise.resolve({
        newOkofRefKey: data[0],
        oldOkofRefKey: data[1],
        molRefKey
      });
    })
    .catch(error => {
      if (error.status) {
        return Promise.reject(error);
      }
      console.log(error);
      return Promise.reject(err_unknown);
    });
};
