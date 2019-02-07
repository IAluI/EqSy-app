/**
 * Action creators для компонентов отображающих страницы обновления базы данных с использлванием заружаемого файла
 * (ведомости).
 *
 * @module src/actions/updateActions
 */

"use strict";

import XLSX from "xlsx";
import { detailedDiff } from "deep-object-diff";

import {
  SET_LOG,
  SET_COMPARE_RESULT,
  CHANGE_PAGE_UPD,
  SORT_TABLE,
  UPDATE_TABLE_STATE,
  CLEAR_TABLE
} from "../actions/actionTypes";
import { SITE_URL, MAX_ROWS } from "../constants";

import { setError } from "./errorActions";
import { progressStart, progressStop } from "../actions/progressActions";

export function addData(tableName, userName, token, addedData, addedHeader) {
  return dispatch => {
    if (addedData.length === 0) {
      dispatch(setError("Необходимо выбрать хотя бы одну позицию для внесения изменений в базу данных"));
      return null;
    }
    dispatch(progressStart());
    fetch(SITE_URL + "api/addData", {
      method: "POST",
      body: JSON.stringify({
        userName,
        token,
        addedData,
        addedHeader
      }),
      headers: {
        "Content-Type": "application/json"
      }
    })
      .then(response => {
        if (!response.ok) {
          return response.text();
        }
        return Promise.resolve();
      })
      .then(res => {
        if (typeof res === "string") {
          throw res;
        }
        //dispatch(clearTable(tableName));
        dispatch(progressStop());
      })
      .catch(res => {
        dispatch(progressStop());
        dispatch(setError(res));
      });
  };
}

export function updateData(tableName, userName, token, updatedData) {
  return dispatch => {
    if (Object.keys(updatedData).length === 0) {
      dispatch(setError("Необходимо выбрать хотя бы одну позицию для внесения изменений в базу данных"));
      return null;
    }
    dispatch(progressStart());
    fetch(SITE_URL + "api/updateData", {
      method: "POST",
      body: JSON.stringify({
        userName,
        token,
        updatedData
      }),
      headers: {
        "Content-Type": "application/json"
      }
    })
      .then(response => {
        if (!response.ok) {
          return response.text();
        }
        return Promise.resolve();
      })
      .then(res => {
        if (typeof res === "string") {
          throw res;
        }
        //dispatch(clearTable(tableName));
        dispatch(progressStop());
      })
      .catch(res => {
        dispatch(progressStop());
        dispatch(setError(res));
      });
  };
}

export function deleteData(tableName, userName, token, invNumToDelete) {
  return dispatch => {
    if (invNumToDelete.length === 0) {
      dispatch(setError("Необходимо выбрать хотя бы одну позицию для внесения изменений в базу данных"));
      return null;
    }
    dispatch(progressStart());
    fetch(SITE_URL + "api/deleteData", {
      method: "POST",
      body: JSON.stringify({
        userName,
        token,
        invNumToDelete
      }),
      headers: {
        "Content-Type": "application/json"
      }
    })
      .then(response => {
        if (!response.ok) {
          return response.text();
        }
        return Promise.resolve();
      })
      .then(res => {
        if (typeof res === "string") {
          throw res;
        }
        //dispatch(clearTable(tableName));
        dispatch(progressStop());
      })
      .catch(res => {
        dispatch(progressStop());
        dispatch(setError(res));
      });
  };
}

function clearTable(tableName) {
  return {
    type: CLEAR_TABLE,
    payload: tableName
  };
}

export function updateTableState(newState, targetTable) {
  return {
    type: UPDATE_TABLE_STATE,
    payload: {
      newState,
      targetTable
    }
  };
}

export function setLog(logArr) {
  return {
    type: SET_LOG,
    payload: logArr
  };
}

function setCompareReult(header, primaryKey, added, updated, deleted) {
  return {
    type: SET_COMPARE_RESULT,
    payload: {
      header,
      primaryKey,
      added,
      updated,
      deleted
    }
  };
}

export function changePageUpd(nextPage, table) {
  return {
    type: CHANGE_PAGE_UPD,
    payload: {
      nextPage,
      table
    }
  };
}

export function sortTable(columnIndex, targetTable) {
  return {
    type: SORT_TABLE,
    payload: {
      columnIndex,
      targetTable
    }
  };
}

export function updateDbData(file, userName, token, history) {
  return dispatch => {
    let compareRes, dataFromFile, dataFromDb;

    dispatch(progressStart());
    Promise.all([
      readFile(file, userName, token),
      getDataFormDb(userName, token)
    ])
      .then(result => {
        dispatch(setLog(result[0].logArr));

        dataFromFile = result[0].dataForCompare;
        dataFromDb = result[1];

        /** Предотвращаем стирание ОКОФ внесенных в БД вручную и отсутсвующих в ведомости */
        for (let key in dataFromFile) {
          if (dataFromFile[key].newOkofKey === null && dataFromDb[key]) {
            dataFromFile[key].newOkofKey = dataFromDb[key].newOkofKey;
          }
          if (dataFromFile[key].oldOkofKey === null && dataFromDb[key]) {
            dataFromFile[key].oldOkofKey = dataFromDb[key].oldOkofKey;
          }
        }
        /**
         * Определяем какое оборудование было поставленно на учет, какие данные были изменены и какое
         * оборудоввание было списанно
         */
        compareRes = detailedDiff(dataFromDb, dataFromFile);
        /** Формируем списки внешних ключей МОЛ, старого и нового ОКОФ упоминаемых в результатах анализа файла */
        const molId = {}, newOkofId = {}, oldOkofId = {};
        for (let key in compareRes.added) {
          if (compareRes.added[key].molKey !== null) {
            molId[compareRes.added[key].molKey] = true;
          }
          if (compareRes.added[key].newOkofKey !== null) {
            newOkofId[compareRes.added[key].newOkofKey] = true;
          }
          if (compareRes.added[key].oldOkofKey) {
            oldOkofId[compareRes.added[key].oldOkofKey] = true;
          }
        }
        for (let key in compareRes.updated) {
          if (dataFromFile[key].molKey !== null) {
            molId[dataFromFile[key].molKey] = true;
          }
          if (dataFromFile[key].newOkofKey !== null) {
            newOkofId[dataFromFile[key].newOkofKey] = true;
          }
          if (dataFromFile[key].oldOkofKey) {
            oldOkofId[dataFromFile[key].oldOkofKey] = true;
          }
        }
        for (let key in compareRes.deleted) {
          if (dataFromDb[key].molKey !== null) {
            molId[dataFromDb[key].molKey] = true;
          }
          if (dataFromDb[key].newOkofKey !== null) {
            newOkofId[dataFromDb[key].newOkofKey] = true;
          }
          if (dataFromDb[key].oldOkofKey) {
            oldOkofId[dataFromDb[key].oldOkofKey] = true;
          }
        }
        /**
         * Запрашиваем у БД данные соответсвующие упоминаемым в результатах анализа внешним ключам для МОЛ, старого и
         * нового ОКОФ
         */
        return fetch(SITE_URL + "api/getRefData", {
          method: "POST",
          body: JSON.stringify({
            userName,
            token,
            molId: Object.keys(molId),
            newOkofId: Object.keys(newOkofId),
            oldOkofId: Object.keys(oldOkofId)
          }),
          headers: {
            "Content-Type": "application/json"
          }
        });
      })
      .then(response => {
        if (!response.ok) {
          return response.text();
        }
        return response.json();
      })
      .then(result => {
        if (typeof result === "string") {
          return Promise.reject(result);
        }
        /**
         * Задаем порядок атрибутов в таблицах отображающих результат анализа данных. Первичный ключ БД отмечен
         * значением "undefined". Данное значение должено быть присловено лишь одному элементу
         * массива atrOrder. Далее определяется номер колонки соответвующей первичному атрибуту
         */
        const atrOrder = [
          "curName",
          undefined /*'curInvNum'*/,
          "curDate",
          "curWorth",
          {
            refName: "molKey",
            atributes: ["curMolSurname", "curMolName", "curMolDep"]
          },
          {
            refName: "newOkofKey",
            atributes: ["curNewOkofCode", "curNewOkofName"]
          },
          {
            refName: "oldOkofKey",
            atributes: ["curOldOkofCode", "curOldOkofName"]
          },
          "curNumber"
        ];
        let primaryKey;
        atrOrder.some((item, index) => {
          if (item === undefined) {
            primaryKey = index;
            return true;
          }
          return false;
        });
        /** Формируем заголовки */
        const header = [], headerForDb = [];
        atrOrder.forEach(item => {
          if (typeof item === "string") {
            header.push(result.transHeader[item]);
            headerForDb.push(item);
          } else if (typeof item === "object") {
            header.push(...item.atributes.map(item => result.transHeader[item]));
            headerForDb.push(item.refName);
          } else {
            header.push(result.transHeader["curInvNum"]);
            headerForDb.push("curInvNum");
          }
        });
        headerForDb.push("niiulEquip");
        headerForDb.push("ouieoOkofKey");
        /** Формируем массивы для таблицы добавленных данных и для отправки этих данных в БД */
        const  addedData = [], addedDataForDb = [], addedDataAppend = {}, niiulEquipment = {}, ouieoOkof = {};
        let code, description, id;
        for (let key in compareRes.added) {
          const row = [];
          const rowForDb = [];
          atrOrder.forEach(item => {
            if (typeof item === "string") {
              row.push(compareRes.added[key][item]);
              rowForDb.push(compareRes.added[key][item]);
            } else if (typeof item === "object") {
              const refIndex = compareRes.added[key][item.refName];
              rowForDb.push(refIndex);
              row.push(...item.atributes.map(atr => {
                if (refIndex === null) {
                  return null;
                }
                return result[item.refName][refIndex][atr];
              }));
            } else {
              row.push(key);
              rowForDb.push(key);
            }
          });
          addedData.push(row);
          addedDataForDb.push(rowForDb);

          addedDataAppend[key] = true;
          niiulEquipment[key] = false;

          id = compareRes.added[key]["newOkofKey"];
          if (id === null) {
            code = "";
            description = "";
            id = "";
          } else {
            code = result["newOkofKey"][id]["curNewOkofCode"];
            description = result["newOkofKey"][id]["curNewOkofName"];
          }
          ouieoOkof[key] = {
            code,
            description,
            id
          };
        }
        /** Формируем массив данных и маску длы таблицы измененных данных */
        const updatedData = [], updatedDataAppend = {}, tableMask = {};
        for (let key in compareRes.updated) {
          const row = [];
          const maskRow = [];
          atrOrder.forEach(item => {
            if (typeof item === "string") {
              row.push(dataFromFile[key][item]);

              if (item in compareRes.updated[key]) {
                maskRow.push(true);
              } else {
                maskRow.push(false);
              }
            } else if (typeof item === "object") {
              const refIndex = dataFromFile[key][item.refName];
              row.push(
                ...item.atributes.map(atr => {
                  if (refIndex === null) {
                    return null;
                  }
                  return result[item.refName][refIndex][atr];
                })
              );

              if (item.refName in compareRes.updated[key]) {
                maskRow.push(...item.atributes.map(() => true));
              } else {
                maskRow.push(...item.atributes.map(() => false));
              }
            } else {
              row.push(key);
              maskRow.push(false);
            }
          });
          updatedData.push(row);
          updatedDataAppend[key] = true;
          tableMask[key] = maskRow;
        }
        /**
         * Формируем массив данных длы табици удаленных данных и массив содержащий инвентарные номера удаленного
         * оборудования для отправки в БД
         */
        const deletedData = [], deletedInvNum = [], deletedDataAppend = {};
        for (let key in compareRes.deleted) {
          const row = [];
          atrOrder.forEach(item => {
            if (typeof item === "string") {
              row.push(dataFromDb[key][item]);
            } else if (typeof item === "object") {
              const refIndex = dataFromDb[key][item.refName];
              row.push(
                ...item.atributes.map(atr => {
                  if (refIndex === null) {
                    return null;
                  }
                  return result[item.refName][refIndex][atr];
                })
              );
            } else {
              row.push(key);
            }
          });
          deletedData.push(row);
          deletedInvNum.push(key);
          deletedDataAppend[key] = true;
        }
        const added = {
          dataForTable: addedData,
          dataForDb: addedDataForDb,
          headerForDb: headerForDb,
          pages: Math.ceil(addedData.length / MAX_ROWS),
          activePage: 1,
          sortOrder: header.map(() => false),
          append: addedDataAppend,
          niiulEquipment,
          ouieoOkof
        };
        const updated = {
          dataForTable: updatedData,
          dataForDb: compareRes.updated,
          pages: Math.ceil(updatedData.length / MAX_ROWS),
          activePage: 1,
          sortOrder: header.map(() => false),
          append: updatedDataAppend,
          tableMask
        };
        const deleted = {
          dataForTable: deletedData,
          dataForDb: deletedInvNum,
          pages: Math.ceil(deletedData.length / MAX_ROWS),
          activePage: 1,
          sortOrder: header.map(() => false),
          append: deletedDataAppend
        };
        dispatch(setCompareReult(header, primaryKey, added, updated, deleted));
        dispatch(progressStop());
        history.push("/app/update/report");
      })
      .catch(err => {
        dispatch(progressStop());
        dispatch(setError(err));
      });
  };
}

function readFile(file, userName, token) {
  if (!file) {
    return Promise.reject("Необходимо выбрать файл");
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = onFileReaded;
    reader.readAsArrayBuffer(file);

    function onFileReaded(e) {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const readingFileResult = XLSX.utils.sheet_to_json(
        workbook.Sheets[workbook.SheetNames[0]],
        { header: 1 }
      );
      /** Задаем название колонок которые требуется найти в анализируемом документе */
      const requiredColumns = {
        name: /Основное средство/i,
        invNum: /Инвентарный номер/i,
        okof: /ОКОФ/i,
        date: /Дата принятия к учету/i,
        worth: /Балансовая стоимость/i,
        number: /Количество/i
      };
      /** Поиск заданных колонок */
      const columnIndex = {};
      const findColumn = (val, index) => {
        let counter = 0;
        for (let key in requiredColumns) {
          if (val.search(requiredColumns[key]) > -1) {
            columnIndex[key] = index;
            delete requiredColumns[key];
          }
          counter++;
        }
        return !!counter;
      };
      for (let i = 0; i < readingFileResult.length && i < 100; i++) {
        if (!readingFileResult[i].every(findColumn)) {
          break;
        }
      }
      if (Object.keys(requiredColumns).length !== 0) {
        reject("Не удалось определить все колонки содержащие данные");
      }
      /** Поиск первой строки с данными и определение первого МОЛа */
      let equipIndex = 1;
      let startRow = -1;
      do {
        startRow++;
      } while (+readingFileResult[startRow][0] !== equipIndex);
      let firstMolIndex = startRow;
      let molFullName = [];
      do {
        firstMolIndex--;
        if (typeof readingFileResult[firstMolIndex][0] === "string") {
          molFullName = readingFileResult[firstMolIndex][0].split(" ");
        }
      } while (molFullName.length !== 3 && firstMolIndex >= 0);
      if (molFullName.length !== 3) {
        reject("Не удалось найти первую запись о МОЛе");
      }
      let curMolSurname = molFullName[0];
      let curMolName = molFullName[1] + " " + molFullName[2];

      function addUniq(obj, value) {
        obj[value] = true;
      }
      const newOkofList = {};
      const oldOkofList = {};
      const molList = {};

      addUniq(molList, molFullName.join(" "));
      /** Создание объекта содержащего данные представленные в файле */
      let curInvNum;
      let curName;
      let curNewOkof;
      let curOldOkof;
      let curDate;
      let curWorth;
      let curNumber;
      const dataFromFile = {};
      const logArr = [];
      for (let i = startRow; i < readingFileResult.length; i++) {
        if (readingFileResult[i][0] !== undefined && +readingFileResult[i][0].replace(/\s/g, "") === equipIndex) {
          equipIndex++;
          /** Читаем инвентарный номер */
          if (readingFileResult[i][columnIndex.invNum] !== undefined) {
            curInvNum = readingFileResult[i][columnIndex.invNum].replace(/\s/g, "");
          } else {
            logArr.push({
              text: "Инвентарный номер не задан для оборудования в строке " + i,
              type: "warning"
            });
            continue;
          }
          if (curInvNum in dataFromFile) {
            logArr.push({
              text: "Инвентарный номер дублируется в строке " + i,
              type: "error"
            });
            continue;
          } else {
            /** Читаем название */
            if (readingFileResult[i][columnIndex.name] !== undefined) {
              curName = readingFileResult[i][columnIndex.name];
            } else {
              curName = null;
            }
            /** Читаем ОКОФ */
            if (readingFileResult[i][columnIndex.okof] !== undefined) {
              curNewOkof = readingFileResult[i][columnIndex.okof].replace(/\s/g, "");
              /**
               * Если окоф новый из строки удаляются все числа, иначе он считается старым и из строки удаляются все
               * символы кроме чисел
               */
              if (/\d\d\d\.\d\d/.test(curNewOkof)) {
                addUniq(newOkofList, curNewOkof);
                curOldOkof = null;
              } else {
                curOldOkof = curNewOkof.replace(/\D/g, "");
                addUniq(oldOkofList, curOldOkof);
                curNewOkof = null;
              }
            } else {
              curOldOkof = null;
              curNewOkof = null;
            }
            /** Читаем год ввода в эксплуатацию */
            if (readingFileResult[i][columnIndex.date] !== undefined) {
              curDate = +readingFileResult[i][columnIndex.date].match(/\d\d\d\d/)[0];
            } else {
              curDate = null;
            }
            /** Читаем стоимость */
            if (readingFileResult[i][columnIndex.worth] !== undefined) {
              curWorth = readingFileResult[i][columnIndex.worth];
            } else {
              curWorth = null;
            }
            /** Читаем количество */
            if (readingFileResult[i][columnIndex.number] !== undefined) {
              curNumber = +readingFileResult[i][columnIndex.number];
            } else {
              curNumber = null;
            }

            dataFromFile[curInvNum] = {
              curName,
              curMolSurname,
              curMolName,
              curNewOkof,
              curOldOkof,
              curDate,
              curWorth,
              curNumber
            };
          }
        } else if (
          readingFileResult[i][0] !== undefined &&
          (molFullName = readingFileResult[i][0].split(" ")).length === 3
        ) {
          curMolSurname = molFullName[0];
          curMolName = molFullName[1] + " " + molFullName[2];
          addUniq(molList, molFullName.join(" "));
        }
      }
      /** Добавляются в БД записи о новых МОЛах. Запрашиваются индексы внешних ключей для МОЛ, нового и сарого ОКОФ.  */
      fetch(SITE_URL + "api/getRefKey", {
        method: "POST",
        body: JSON.stringify({
          userName,
          token,
          newOkofList: Object.keys(newOkofList),
          oldOkofList: Object.keys(oldOkofList),
          molList: Object.keys(molList)
        }),
        headers: {
          "Content-Type": "application/json"
        }
      })
        .then(response => {
          if (!response.ok) {
            return response.text();
          }
          return response.json();
        })
        .then(result => {
          if (typeof result === "string") {
            reject(result);
          }
          /** Формируем объекты содержащие внешние ключи главной таблице в формате [данные]: ключ */
          const newOkofRefKey = {}, oldOkofRefKey = {}, molRefKey = {};
          result.newOkofRefKey.forEach(item => {
            newOkofRefKey[item["Код новый ОКОФ"]] = item["ID_ОКОФ_новый"];
          });
          result.oldOkofRefKey.forEach(item => {
            oldOkofRefKey[item["Код старый ОКОФ"]] = item["ID_ОКОФ_старый"];
          });
          result.molRefKey.forEach(item => {
            const key = item["Фамилия МОЛ"] + " " + item["Имя Отчество МОЛ"];
            molRefKey[key] = item["ID_Мат_ответств"];
          });
          /** Подставляем значения внешних ключей заместо данных полученных из таблицы */
          const dataForCompare = {};
          for (let key in dataFromFile) {
            let newOkofKey, oldOkofKey, molKey, mol;

            if (dataFromFile[key].curNewOkof === null) {
              newOkofKey = null;
            } else if (newOkofRefKey[dataFromFile[key].curNewOkof] === undefined) {
              logArr.push({
                text: 'Ну удалось определить внеший ключ для нового ОКОФ "' + dataFromFile[key].curNewOkof +
                '". Инвентарный номер "' + key + '". Данное значение будет считаться отсутствующим.',
                type: "error"
              });
              newOkofKey = null;
            } else {
              newOkofKey = newOkofRefKey[dataFromFile[key].curNewOkof];
            }

            if (dataFromFile[key].curOldOkof === null) {
              oldOkofKey = null;
            } else if (oldOkofRefKey[dataFromFile[key].curOldOkof] === undefined) {
              logArr.push({
                text:
                'Ну удалось определить внеший ключ для старого ОКОФ "' + dataFromFile[key].curOldOkof +
                '". Инвентарный номер "' + key + '". Данное значение будет считаться отсутствующим.',
                type: "error"
              });
              oldOkofKey = null;
            } else {
              oldOkofKey = oldOkofRefKey[dataFromFile[key].curOldOkof];
            }

            mol = dataFromFile[key].curMolSurname + " " + dataFromFile[key].curMolName;
            molKey = molRefKey[mol];

            dataForCompare[key] = {
              curName: dataFromFile[key].curName,
              curDate: dataFromFile[key].curDate,
              curWorth: dataFromFile[key].curWorth,
              curNumber: dataFromFile[key].curNumber,
              newOkofKey,
              oldOkofKey,
              molKey
            };
          }

          resolve({
            dataForCompare,
            logArr
          });
        });
    }
  });
}

function getDataFormDb(userName, token) {
  return fetch(SITE_URL + "api/getDataForCompare", {
    method: "POST",
    body: JSON.stringify({ userName, token }),
    headers: {
      "Content-Type": "application/json"
    }
  })
    .then(response => {
      if (!response.ok) {
        return response.text();
      }
      return response.json();
    })
    .then(result => {
      if (typeof result === "string") {
        return Promise.reject(result);
      }
      return Promise.resolve(result);
    });
}
