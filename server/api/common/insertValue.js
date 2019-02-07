/**
 * Вспомогательная функция для форматирования значений используемых для формирования SQL запросов.
 * @module api/common/insertValue
 */

'use strict';

/**
 * Преобразует входное значение в строку.
 * @param {?string|number|boolean} val
 * @returns {string}
 */
module.exports = function insertValue(val) {
  if (val === "" || val === null) {
    return "NULL";
  }
  if (typeof val === "boolean") {
    return "'" + +val + "'";
  }
  if (typeof val === "string") {
    return "'" + val.replace(/'/g, "''") + "'";
  }
  return "'" + val + "'";
};
