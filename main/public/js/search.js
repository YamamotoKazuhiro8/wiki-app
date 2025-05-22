
// 注意:new Map(Object.entries(data.results))は大量になると重い。Object.keys(data.results)を使う
// 次: ページ検索とタグ検索両方に用いる抽象化

let previousInput_tag = [];           // 前回のタグ欄での検索ワード
const selectedTagList = new Map();    // 選択中のタグ<id, name>
let tagSearchController = null;       // AbortController管理

// ーーー初期化ーーー
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('input-tag').addEventListener('input', debouncedTagInput);
});

// ーーーメイン処理ーーー
const debouncedTagInput = debounce(handleTagInput, 300);

// タグ入力の処理（debounce適用済みで呼ばれる）
async function handleTagInput() {
    const tags = getInputTags();

    // 前回と同じなら処理しない
    if (arrayEqual(previousInput_tag, tags)) return;
    previousInput_tag = tags;

    if (tags.length === 0) {
        setSuggested_Tag(new Map());
        setSearchState_tag('close');
        return;
    }

    setSearchState_tag('');
    setSuggested_Tag(new Map());

    // 既存リクエストをキャンセル
    if (tagSearchController) tagSearchController.abort();
    tagSearchController = new AbortController();

    try {
        const result = await searchTag(tags, tagSearchController.signal);
        if (setSuggested_Tag(result)) {
            setSearchState_tag('');
            return;
        }
        setSearchState_tag('noData');
    } catch (error) {
        if (error.name === 'noData') {
            setSearchState_tag('noData');
            return;
        }
        // ここでエラーメッセージ表示など
        console.error(error);
        setSearchState_tag('error');
    }
}

// ーーーユーティリティ関数ーーー

// 配列の比較（単純な値の一致）
function arrayEqual(a, b) {
    if (a.length !== b.length) return false;
    return a.every((val, index) => val === b[index]);
}

// debounce関数
function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// サジェスト用タグボタン作成
function suggestedTag(name, onclick) {
    const button = document.createElement('button');
    button.className = 'suggested-tag';
    button.textContent = name;
    button.addEventListener('click', () => onclick(button));
    return button;
}

// 選択中タグ表示要素作成
function selectedTag(id, name, onclick) {
    const div = document.createElement('div');
    div.className = 'selected-tag';

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

// ーーーDOM操作ーーー

// サジェスト欄にタグを追加
// 返り値: 新しいタグを追加できたかどうか
function setSuggested_Tag(tags) {
    const div = document.getElementById('suggested-tag-list');
    div.innerHTML = '';  // 既存の候補をクリア
    if (tags.size === 0) return false;

    const fragment = document.createDocumentFragment();
    let added = false;
    tags.forEach((name, id) => {
        if (selectedTagList.has(id)) return;  // 既に選択済みはスキップ
        added = true;

        const button = suggestedTag(name, btn => {
            btn.remove();
            addToSelectedTagList(id, name);
        });

        fragment.appendChild(button);
    });

    if (!added) return false;

    div.appendChild(fragment);
    return true;
}

// 選択タグリストに追加
function addToSelectedTagList(id, name) {
    const div = document.getElementById('selected-tag-list');

    if (selectedTagList.size === 0) {
        // 「すべて」タグ非表示（初回追加時）
        div.querySelector('.selected-tag').classList.add('hidden');
    }

    selectedTagList.set(id, name);

    const tag = selectedTag(id, name, (_id, btn) => {
        removeFromSelectedTagList(_id, btn);
    });

    div.appendChild(tag);
}

// 選択タグリストから削除
function removeFromSelectedTagList(id, tagButton) {
    selectedTagList.delete(id);
    tagButton.remove();

    if (selectedTagList.size === 0) {
        // 「すべて」タグを表示
        const div = document.getElementById('selected-tag-list');
        div.querySelector('.selected-tag').classList.remove('hidden');
    }
}

// 検索状態表示切り替え
// 'close', 'noData', '' などの状態文字列で切り替え
function setSearchState_tag(state) {
    document.getElementById('tag-search-state').textContent = state;
}

// ーーー検索関数ーーー

// 入力タグ文字列から配列取得
function getInputTags() {
    const input = document.getElementById('input-tag').value;
    return input.split(/[\s\u3000]/ug).filter(phrase => phrase.trim() !== '');
}

// タグ検索 API 呼び出し
/**
 * @param {string[]} word タグキーワード配列
 * @param {AbortSignal} signal キャンセル信号
 * @return {Promise<Map<Number,string>>} 検索結果マップ<tag_id, name>
 */
async function searchTag(word, signal) {
    const res = await fetch('/api/search', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            type: 'tag',
            keyword: word
        }),
        signal // fetch のキャンセル用信号
    });

    if (!res.ok) throw new Error(res.status);

    const data = await res.json();

    if (data.status === 'error') {
        const err = new Error(data.message);
        err.name = 'error';
        throw err;
    } else if (data.status === 'noData') {
        const err = new Error('データなし');
        err.name = 'noData';
        throw err;
    }

    return new Map(Object.entries(data.results));
}