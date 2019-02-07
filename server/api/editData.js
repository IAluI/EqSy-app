/**
 * Модуль отвечающий за редактирования данных в БД.
 * @module api/editData
 */

'use strict';

const db = require("../db/index");

const checkToken = require("./common/checkToken");
const insertValue = require("./common/insertValue");
const editableAttributes = require("../json/editableAttributes.json");

const err_unknown = { status: "500", text: "Неизвестная ошибка сервера" };
const err_permission = { status: "403", text: "Forbidden" };
/**
 * @param {Object} inputData - Объект описывающий запрос на редактирование данных в БД.
 * @param {Object} inputData.editedData - Объект содержащий новые значения атрибутов.
 * @param {string} inputData.editedData.atrName - Новое значение атрибута atrName.
 * @param {string} inputData.pKey - Значение первичного ключа главной таблице данные для которого требуется изменить.
 * @param {Object} inputData.userData - Объект содержащий данные пользователя.
 * @param {string} inputData.userData.userName
 * @param {number} inputData.userData.token
 * @param {Object} atr_conf
 * @param {Object} db_struct
 * @returns {Promise}
 */
module.exports = function editData(inputData, atr_conf, db_struct) {
  const { editedData, pKey, userData } = inputData;

  let refAtr = [], updatedAtrArr = [];
  return checkToken(userData.userName, userData.token)
    .then(res => {
      if (res.editAllow) {
        let conditions, insertAtr, insertVal, newValue, isRefNull, isRefNotInQuery;
        db_struct.tableAttribute.forEach(item => {
          if (typeof item === "object") {
            conditions = [];
            insertAtr = [];
            insertVal = [];
            isRefNull = true;
            isRefNotInQuery = true;
            item.tableAttribute.forEach(item => {
              if (atr_conf[item].visibleName in editedData) {
                newValue = editedData[atr_conf[item].visibleName];
                isRefNull = isRefNull && !newValue;
                isRefNotInQuery = false;
                conditions.push('"' + item + '" = ' + insertValue(newValue));
                insertAtr.push('"' + item + '"');
                insertVal.push(insertValue(newValue));
              }
            });
            if (isRefNotInQuery) {}
            else if (isRefNull) {
              updatedAtrArr.push('"' + item.foreignKey + '" = NULL');
            } else if (conditions.length > 0) {
              refAtr.push([
                item.foreignKey,
                item.tableName,
                conditions,
                insertAtr,
                insertVal
              ]);
            }
          } else if (atr_conf[item].visibleName in editedData) {
            updatedAtrArr.push('"' + item + '" = ' + insertValue(editedData[atr_conf[item].visibleName]));
          }
        });

        if (refAtr.length > 0) {
          return db.tx(t => {
            const queries = refAtr.map(item =>
              t.any('SELECT "' + item[0] + '" FROM "' + item[1] + '" WHERE ' + item[2].join(" AND "))
            );
            return t
              .batch(queries)
              .then(data => {
                const insertArr = [];
                data.forEach((item, index) => {
                  if (item.length === 1) {
                    for (let key in item[0]) {
                      updatedAtrArr.push(
                        '"' + key + '" = ' + "'" + item[0][key] + "'"
                      );
                    }
                  } else {
                    insertArr.push(
                      t.one('INSERT INTO "' + refAtr[index][1] + '" (' + refAtr[index][3].join(", ") + ") VALUES (" +
                        refAtr[index][4].join(", ") + ') RETURNING "' + refAtr[index][0] + '"')
                    );
                  }
                });
                if (insertArr.length > 0) {
                  return t.batch(insertArr);
                }
                return Promise.resolve([]);
              })
              .then(data => {
                data.forEach(item => {
                  for (let key in item) {
                    updatedAtrArr.push(
                      '"' + key + '" = ' + "'" + item[key] + "'"
                    );
                  }
                });
                return t.none('UPDATE "Оборудование" SET ' + updatedAtrArr.join(", ") +
                  ' WHERE "Инвентарный номер" = ' + "'" + pKey + "'");
              });
          });
        } else {
          return db.none('UPDATE "Оборудование" SET ' + updatedAtrArr.join(", ") + ' WHERE "Инвентарный номер" = ' +
            "'" + pKey + "'");
        }
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
