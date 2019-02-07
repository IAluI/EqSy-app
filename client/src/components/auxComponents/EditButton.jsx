/**
 * Компонент отображающий кнопку вызывающую диалог для редактирования данных в БД.
 *
 * @module src/components/auxComponents/EditButton
 */

"use strict";

import React, { Component } from "react";
import PropTypes from "prop-types";

import IconButton from "@material-ui/core/IconButton";
import Edit from "@material-ui/icons/Edit";

/**
 * @param {number} rowIndex - Номер строки на текущей страницы
 * @param {func} onClick - Функция благодаря которой отображается диалог редактирования данных для текущей строки
 */
function EditButton({ rowIndex, onClick }) {
  const handleOnClick = () => {
    onClick(rowIndex);
  };

  return (
    <IconButton onClick={handleOnClick} >
      <Edit />
    </IconButton>
  );
}
/** Проверка типов props */
EditButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  rowIndex: PropTypes.number
};
export default EditButton;
