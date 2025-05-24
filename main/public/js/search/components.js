
const { classNames } = require('./classNames');
const { createElement } = require('./domUtils');

// サジェスト用タグボタン作成
function suggestedTag(name, onclick) {
    const button = document.createElement('button');
    button.className = classNames.TAG_SUGGESTED_ITEM;
    button.textContent = name;
    button.addEventListener('click', () => onclick(button));
    return button;
}

// 選択中タグ表示要素作成
function selectedTag(id, name, onclick) {
    const div = document.createElement('div');
    div.className = classNames.TAG_SELECTED_ITEM;

    const span = document.createElement('span');
    span.textContent = name;
    div.appendChild(span);

    const button = document.createElement('button');
    button.textContent = '×';
    button.dataset.tagID = id;
    button.addEventListener('click', () => onclick(id, div));
    div.appendChild(button);

    return div;
}

module.exports = { suggestedTag, selectedTag };