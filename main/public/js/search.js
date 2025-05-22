
// 注意:new Map(Object.entries(data.results))は大量になると重い。Object.keys(data.results)を使う

let previousInput_tag = [];        // 前回のタグ欄での検索ワード
const selectedTagList = new Map(); // 選択中のタグ<id, name>

// 単語配列の比較
function arrayEqual(a, b) {
    if (a.length !== b.length) return false;
    return a.every((val, index) => val === b[index]);
}

// サジェストするタグ
function suggestedTag(name, onclick) {
    const button = document.createElement('button');
    button.className = `suggested-tag`;
    button.textContent = name;
    button.addEventListener('click', () => {onclick(button);})
    return button;
}

// 選択されたタグ
function selectedTag(id, name, onclick) {
    const div = document.createElement('div');
    div.className = 'selected-tag';

    const span = document.createElement('span');
    span.textContent = name;
    div.appendChild(span);

    const button = document.createElement('button');
    button.textContent = '×';
    button.dataset.tagID = id;
    button.addEventListener('click', () => {onclick(id, div)});
    div.appendChild(button);

    return div;
}


// タグ検索入力欄の変更
document.getElementById('input-tag').addEventListener('input', debouncedTagInput)

// debounceで300ms以内の連続入力を制御
const debouncedTagInput = debounce(handleTagInput, 300);

// debounce関数の定義
function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout); // 前回のタイマーをキャンセル
        timeout = setTimeout(() => {
            func.apply(this, args); // 一定時間後に実行
        }, wait);
    };
}

// タグ検索処理
async function handleTagInput() {
    // 入力されたタグの取得
    const tags = getTags();
    if(!shouldStartTagSearch(tags)) return;
    beforeTagSearch();

    const result = await searchTag(tags);

    // 結果表示待ちか判定

    onTagSearchComplete(result);
}

// AbortController
let tagSearchController = null;
async function handleTagInput() {
    const tags = getTags();
    if (!shouldStartTagSearch(tags)) return;
    beforeTagSearch();

    // リクエスト中の検索をキャンセル
    if (tagSearchController) tagSearchController.abort();
    // AbortControllerを作成
    tagSearchController = new AbortController();

    try {
        const result = await searchTag(tags, tagSearchController.signal); // 必ず1つ以上のタグ
        onTagSearchComplete(result);
    } catch(error) {
        if(error.name === 'noData'){
            // noDataの表示
            return;
        }
        // エラーの表示
        return;
    }
}


// タグの検索
/**
 * @param {string} word
 * @return {Promise<Map<Number, string>>} 検索結果（タグのMap）<tag_id, name>
 */
async function searchTag(word, signal){

    const res = await fetch('/api/search', {
        method:'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            type: 'tag',    // type設定
            keyword: word   // 検索ワード
        })
    });

    if(!res.ok) throw new Error(res.status);

    const data = await res.json();

    if(data.status === 'error') {
        const err = new Error(data.message);
        err.name = 'error';
        throw err;
    } else if(data.status === 'noData') {
        const err = new Error('データなし');
        err.name = 'noData';
        throw err;
    }

    // Mapに変換
    return new Map(Object.entries(data.results));
}


// タグサーチを開始するか判定
function shouldStartTagSearch() {
    // 条件判定処理（例：入力が空でない、通信中でないなど）
}

// タグサーチの開始直前に呼ばれる
// UIの準備
function beforeTagSearch() {
    // 読み込み中の表示
}

// タグサーチ完了時に呼び出される
// 
function onTagSearchComplete(result) {
    // 読み込み表示の終了

    // サジェストに追加
}

// ーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーー

/**
 * サジェスト欄にタグを追加
 * @param {Map<Number,string>} tags 
 * @returns 
 */
function setSuggestedTags(tags){
    const div = document.getElementById('suggested-tag-list');
    div.innerHTML = ''; // サジェスト欄破棄
    if(tags.size === 0) return;

    // 
    const fragment = document.createDocumentFragment();
    let added = false;
    tags.forEach((name, id) => {
        // 既にtag-listに含まれているか
        if(selectedTagList.has(id)) return;
        added = true;

        // タグ作成
        const button = suggestedTag(name, (btn) => {
            btn.remove();
            addToSelectedTagList(id, name);
        })

        fragment.appendChild(button);
    });

    if(!added){ // サジェストタグなし
        setSearchState('noData');
        return;
    }

    div.appendChild(fragment);
}

// 検索状況（サジェスト欄の上）
function setSearchState(state) {
    if(state === ''){
        document.getElementById('tag-search-state').classList.add('hidden');
        return;
    }
    const div = document.getElementById('tag-search-state');
    div.textContent = state;
    div.classList.remove('hidden');
}

// タグ検索入力欄の変更
document.getElementById('input-tag').addEventListener('input', async (event) => {
    const text = event.target.value;

    /// 空白を削除
    const words = text.split(/[\s\u3000]/ug).filter(phrase => phrase.trim() !== '');

    // 前回の検索との比較
    if(arrayEqual(previousInput_tag, words)){
        return;
    }

    previousInput_tag = words;
    setSuggestedTags(new Map()); // サジェスト欄破棄

    // キーワードなし
    if(words.length === 0){
        setSearchState(''); // 検索状態欄の破棄
        return;
    }

    // とりあえず一つ目だけ
    const word_ = words[0];

    // 中間一致検索
    setSearchState('loading');
    const results = await searchTag(word_);
    if(results === null) {
        setSearchState("error");
        return;
    }

    // 検索結果なし
    if(results.size === 0) {
        setSearchState('noData');
        return;
    }

    setSearchState('');
    setSuggestedTags(results);
});

function addToSelectedTagList(id, name) {
    const div = document.getElementById('selected-tag-list');

    if(selectedTagList.size === 0) { 
        // 「すべて」タグを無効にする
        div.querySelector('.selected-tag').classList.add('hidden');
    }

    // 選択中のタグに追加
    selectedTagList.set(id, name);

    // タグボタンの作成
    const tag = selectedTag(id, name, (_id, btn) => {
        removeFromSelectedTagList(_id, btn);
    })

    // タグボタンを追加
    div.appendChild(tag);
}

function removeFromSelectedTagList(id, tagButton) {
    // 選択中のリストから削除
    selectedTagList.delete(id);
    // タグボタンを親から削除
    tagButton.remove();

    if(selectedTagList.size === 0){
        // 「すべて」タグを有効にする
        document.getElementById('selected-tag-list').querySelector('.selected-tag').classList.remove('hidden');
    }
}