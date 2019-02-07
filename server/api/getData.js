/**
 * Модуль отвечающий за обработку запросов на выборку данных из БД.
 * @module api/getData
 */

'use strict';

const db = require("../db/index");

const operators = require("../json/operators.json");
const editableAttributes = require("../json/editableAttributes.json");
const checkToken = require("./common/checkToken");

const err_nf = { status: "404", text: "Данные не найдены" };
const err_unknown = { status: "500", text: "Неизвестная ошибка сервера" };
/** 
 * @param {Object} inputData
 * @param {Object} transAtr
 * @param {Object} dbStruct
 * @returns {Promise}
 */
module.exports = function getData(inputData, transAtr, dbStruct) {
  const { userName, token, query } = inputData;
  
  let allowAtr, editAllow;
  return checkToken(userName, token)
    .then(res => {
      allowAtr = res.allowAtr;
      editAllow = res.editAllow;
      /**
       * К сформированному запросу добавляются условия по умолчанию для пользователей не имеющих привелегии
       * редактировать БД.
       */
      return db.any(createQuery(query, allowAtr, transAtr, dbStruct) + (editAllow ? '' : ' AND "Оборудование"."НИ и УЛ оборудование" = true'));
    })
    .then(data => {
      if (Object.keys(data).length > 0) {
        const header = [];
        const atrType = [];
        const editableAtr = {};
        const tableHeader = [];
        const table = new Array(data.length);

        allowAtr.forEach(item => {
          if (item in data[0]) {
            header.push(item);
            tableHeader.push(transAtr[item].visibleName);
            atrType.push(transAtr[item].type);
            if (item in editableAttributes && editAllow) {
              editableAtr[transAtr[item].visibleName] = true;
            }
          }
        });
        for (let i = 0; i < data.length; i++) {
          table[i] = new Array(header.length);
          for (let j = 0; j < header.length; j++) {
            table[i][j] = data[i][header[j]];
          }
        }
        let primaryKey = -1;
        header.some((item, index) => {
          if (item === "Инвентарный номер") {
            primaryKey = index;
            return true;
          }
          return false;
        });
        const out = {
          header: tableHeader,
          atrType: atrType,
          data: table,
          primaryKey,
          editableAtr
        };
        return Promise.resolve(out);
      }
      return Promise.reject(err_nf);
    })
    .catch(error => {
      if (error.status) {
        return Promise.reject(error);
      }
      console.log(error);
      return Promise.reject(err_unknown);
    });
};
/**
 * Формирует SQL запрос на выборку данных из БД.
 * 
 * @param {Object} query - Объект описывающий запрос к БД.
 * @param {Object} query.atrName - Объект описывающий часть запроса относящуюся к атрибуту atrName.
 * @param {boolean} query.atrName.show - Добавить ли данный атрибут к результату запроса.
 * @param {number} query.atrName.operator - Индекс оператора.
 * @param {string} query.atrName.operand - Строка содержащая операнд.
 * 
 * @param {Array} allowAtr - Массив содержащий имена доступных пользователю атрибутов.
 * 
 * @param {Object} transAtr - Объект описывающий атрибуты БД.
 * @param {Object} transAtr.atrName - Объект описывающий атрибут atrName.
 * @param {string} transAtr.atrName.visibleName - Видимое пользователю имя атрибута.
 * @param {string} transAtr.atrName.type - Тип данных атрибута.
 * 
 * @param {Object} dbStruct - Объект описывающий структуру БД.
 * @param {string} dbStruct.tableName - Имя таблицы.
 * @param {string} dbStruct.foreignKey - Имя атрибута являющегося внешнем ключом другой таблицы.
 * @param {Array} dbStruct.tableAttribute - Массив атрибутов таблицы. Атрибутом может являтся объект такой же
 * структуры как и dbStruct описывающий таблицу внешних ключей, если данный атрибут является внешним ключом.
 * 
 * @returns {string}
 */
function createQuery(query, allowAtr, transAtr, dbStruct) {
  let transQuery = {};
  allowAtr.forEach(item => {
    if (transAtr[item].visibleName in query) {
      transQuery[item] = query[transAtr[item].visibleName];
    }
  });

  let select = "SELECT ";
  let from = "FROM ";
  let join = "";
  let where = "WHERE ";

  function createDbQuery(tableStuct) {
    let joinFlag = false;
    tableStuct.tableAttribute.forEach(item => {
      if (item in transQuery) {
        joinFlag = true;
        if (transQuery[item].show) {
          select += '"' + tableStuct.tableName + '"."' + item + '", ';
        }
        if (transQuery[item].operator > 9) {
          where += '"' + tableStuct.tableName + '"."' + item + '" ' + operators[transQuery[item].operator] + " AND ";
        } else if (transQuery[item].operand) {
          where += '"' + tableStuct.tableName + '"."' + item + '" ' + operators[transQuery[item].operator] + " '" +
            transQuery[item].operand + "' AND ";
        }
      } else if (typeof item === "object") {
        createDbQuery(item);
      }
    });
    if ("foreignKey" in tableStuct && joinFlag) {
      join += 'LEFT JOIN "' + tableStuct.tableName + '" USING ("' + tableStuct.foreignKey + '") ';
    } else if (joinFlag) {
      from += '"' + tableStuct.tableName + '" ';
    }
  }

  createDbQuery(dbStruct);
  select = select.slice(0, select.length - 2) + " ";
  where += '"Оборудование"."Списание_ID" IS NULL';

  return select + from + join + where;
}
