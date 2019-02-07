/**
 * Модуль отвечающий за получения данных о МОЛ, новом и старом ОКОФ по значениям первичныых ключей.
 * @module api/getRefData
 */

"use strict";

const db = require("../db/index");

const checkToken = require("./common/checkToken");

const err_unknown = { status: "500", text: "Неизвестная ошибка сервера" };
const err_permission = { status: "403", text: "Forbidden" };
/**
 * Производит выборку данных по первичным ключам для таблиц содержащих данные о МОЛ, новом и старом ОКОФ. Возвращает
 * объект содержазий объекты вида [первичный_ключ]: {данные}, а также объект transHeader содержащий информацию о
 * пользовательских именах атрибутов используемых при отображении результатов анализа ведомости.
 * 
 * @param {Object} inputData
 * @param {string} inputData.userName
 * @param {number} inputData.token
 * @param {Array} inputData.molId - Массив первичных колючей для поиска записей о МОЛ.
 * @param {Array} inputData.newOkofId - Массив первичных колючей для поиска записей о новом ОКОФ.
 * @param {Array} inputData.oldOkofId - Массив первичных колючей для поиска записей о старом ОКОФ.
 *
 * @param {Object} atr_conf - Объект описывающий атрибуты БД.
 * @param {Object} atr_conf.atrName - Объект описывающий атрибут atrName.
 * @param {string} atr_conf.atrName.visibleName - Видимое пользователю имя атрибута.
 * @param {string} atr_conf.atrName.type - Тип данных атрибута.
 * @returns {Promise}
 */
module.exports = function getRefData(inputData, atr_conf) {
  const { userName, token, molId, newOkofId, oldOkofId } = inputData;
  
  return checkToken(userName, token)
    .then(res => {
      if (res.editAllow) {
        const requests = [];
        /** Если какой либо из массивов пуст запрашиваем в БД заводомо отсутствующее значение первичного ключа '-1' */
        requests.push({
          query:
            'SELECT "ID_ОКОФ_новый", "Код новый ОКОФ", "Описание новый ОКОФ" FROM "Новый ОКОФ" WHERE "ID_ОКОФ_новый" IN ($1:csv)',
          data: !newOkofId.length?[-1]:newOkofId
        });
        requests.push({
          query:
            'SELECT "ID_ОКОФ_старый", "Код старый ОКОФ", "Описание старый ОКОФ" FROM "Старый ОКОФ" WHERE "ID_ОКОФ_старый" IN ($1:csv)',
          data: !oldOkofId.length?[-1]:oldOkofId
        });
        requests.push({
          query:
            'SELECT "ID_Мат_ответств", "Фамилия МОЛ", "Имя Отчество МОЛ", "Базовое подразделение МОЛ" FROM "Материально ответственное лицо" WHERE "ID_Мат_ответств" IN ($1:csv)',
          data: !molId.length?[-1]:molId
        });

        return db.tx(t => {
          return t.batch(requests.map(item => t.any(item.query, [item.data])));
        });  
      }
      throw err_permission;
    })
    .then(data => {
      const transHeader = {
        curName: atr_conf["Наименование"]["visibleName"],
        curInvNum: atr_conf["Инвентарный номер"]["visibleName"],
        curDate: atr_conf["Год ввода в эксплуатацию"]["visibleName"],
        curWorth: atr_conf["Стоимость"]["visibleName"],
        curMolSurname: atr_conf["Фамилия МОЛ"]["visibleName"],
        curMolName: atr_conf["Имя Отчество МОЛ"]["visibleName"],
        curMolDep: atr_conf["Базовое подразделение МОЛ"]["visibleName"],
        curNewOkofCode: atr_conf["Код новый ОКОФ"]["visibleName"],
        curNewOkofName: atr_conf["Описание новый ОКОФ"]["visibleName"],
        curOldOkofCode: atr_conf["Код старый ОКОФ"]["visibleName"],
        curOldOkofName: atr_conf["Описание старый ОКОФ"]["visibleName"],
        curNumber: atr_conf["Количество"]["visibleName"]
      };
      const newOkofKey = {};
      data[0].forEach(item => {
        newOkofKey[item["ID_ОКОФ_новый"]] = {
          curNewOkofCode: item["Код новый ОКОФ"],
          curNewOkofName: item["Описание новый ОКОФ"]
        };
      });
      const oldOkofKey = {};
      data[1].forEach(item => {
        oldOkofKey[item["ID_ОКОФ_старый"]] = {
          curOldOkofCode: item["Код старый ОКОФ"],
          curOldOkofName: item["Описание старый ОКОФ"]
        };
      });
      const molKey = {};
      data[2].forEach(item => {
        molKey[item["ID_Мат_ответств"]] = {
          curMolSurname: item["Фамилия МОЛ"],
          curMolName: item["Имя Отчество МОЛ"],
          curMolDep: item["Базовое подразделение МОЛ"]
        };
      });

      return Promise.resolve({
        newOkofKey,
        oldOkofKey,
        molKey,
        transHeader
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
