

// domUtils.js

/**
 * IDで要素を取得
 * @param {string} id
 * @returns {HTMLElement | null}
 */
function getById(id) {
    return document.getElementById(id);
}

/**
 * クラス名で要素を取得
 * @param {string} className
 * @returns {HTMLCollectionOf<Element>}
 */
function getByClass(className) {
  return document.getElementsByClassName(className);
}

/**
 * セレクターで要素を1つ取得
 * @param {string} selector
 * @returns {Element | null}
 */
function query(selector) {
    return document.querySelector(selector);
}

/**
 * セレクターで要素を複数取得
 * @param {string} selector
 * @returns {NodeListOf<Element>}
 */
function queryAll(selector) {
    return document.querySelectorAll(selector);
}

/**
 * 要素の作成
 * @param {string} element
 * @returns {Element}
 */
function create(element) {
    return document.createElement(element);
}

module.exports = {getById, getByClass, query, queryAll, create};