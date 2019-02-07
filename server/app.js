/**
 * Главный модуль сервера.
 * @module app
 */

"use strict";

const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");

const signIn = require("./api/signIn");
const getData = require("./api/getData");
const getDataForCompare = require("./api/getDataForCompare");
const getRefKey = require("./api/getRefKey");
const getRefData = require("./api/getRefData");
const getOuieoOkofList = require("./api/getOuieoOkofList");
const editData = require("./api/editData");
const addData = require("./api/addData");
const updateData = require("./api/updateData");
const deleteData = require("./api/deleteData");
/**
 * Инициализирует и запускает сервер статических фалов и API для обработки запросов клиента.
 * 
 * @param {Object} db_struct - Объект описывающий структуру БД.
 * @param {string} db_struct.tableName - Имя таблицы.
 * @param {string} db_struct.foreignKey - Имя атрибута являющегося внешнем ключом другой таблицы.
 * @param {Array} db_struct.tableAttribute - Массив атрибутов таблицы. Атрибутом может являтся объект такой же
 * структуры как и db_struct описывающий таблицу внешних ключей, если данный атрибут является внешним ключом.
 * 
 * @param {Object} atr_conf - Объект описывающий атрибуты БД.
 * @param {Object} atr_conf.atrName - Объект описывающий атрибут atrName.
 * @param {string} atr_conf.atrName.visibleName - Видимое пользователю имя атрибута.
 * @param {string} atr_conf.atrName.type - Тип данных атрибута.
 */
module.exports = function application(db_struct, atr_conf) {
  const app = express();
  app.set("port", "3000");
  app.use(bodyParser.json());
  /**
   * API
   */
  app.post("/api/signIn", (req, res) => {
    signIn(req.body, atr_conf)
      .then(resolve => {
        res.json(resolve);
      })
      .catch(reject => {
        res.status(reject.status).send(reject.text);
      });
  });
  app.post("/api/getData", (req, res) => {
    getData(req.body, atr_conf, db_struct)
      .then(resolve => {
        res.json(resolve);
      })
      .catch(reject => {
        res.status(reject.status).send(reject.text);
      });
  });
  app.post("/api/getDataForCompare", (req, res) => {
    getDataForCompare(req.body)
      .then(resolve => {
        res.json(resolve);
      })
      .catch(reject => {
        res.status(reject.status).send(reject.text);
      });
  });
  app.post("/api/getRefKey", (req, res) => {
    getRefKey(req.body)
      .then(resolve => {
        res.json(resolve);
      })
      .catch(reject => {
        res.status(reject.status).send(reject.text);
      });
  });
  app.post("/api/getRefData", (req, res) => {
    getRefData(req.body, atr_conf)
      .then(resolve => {
        res.json(resolve);
      })
      .catch(reject => {
        res.status(reject.status).send(reject.text);
      });
  });
  app.post("/api/getOuieoOkofList", (req, res) => {
    getOuieoOkofList(req.body)
      .then(resolve => {
        res.json(resolve);
      })
      .catch(reject => {
        res.status(reject.status).send(reject.text);
      });
  });
  app.post("/api/editData", (req, res) => {
    editData(req.body, atr_conf, db_struct)
      .then(resolve => {
        res.json(resolve);
      })
      .catch(reject => {
        res.status(reject.status).send(reject.text);
      });
  });
  app.post("/api/addData", (req, res) => {
    addData(req.body)
      .then(resolve => {
        res.json(resolve);
      })
      .catch(reject => {
        res.status(reject.status).send(reject.text);
      });
  });
  app.post("/api/updateData", (req, res) => {
    updateData(req.body)
      .then(resolve => {
        res.json(resolve);
      })
      .catch(reject => {
        res.status(reject.status).send(reject.text);
      });
  });
  app.post("/api/deleteData", (req, res) => {
    deleteData(req.body)
      .then(resolve => {
        res.json(resolve);
      })
      .catch(reject => {
        res.status(reject.status).send(reject.text);
      });
  });
  /**
   * STATIC FILES
   */
  app.use(express.static(path.resolve(__dirname, "./dist")));
  app.use("*", function(req, res) {
    res.redirect("/");
  });

  app.listen(app.get("port"), () => {
    console.log("App listening on port 3000!");
  });
};