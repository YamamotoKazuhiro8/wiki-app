
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

// タグの検索
/**
 * 
 * @param {string} word
 * @return {Promise<Map<Number, string>>} 検索結果（タグのMap）<tag_id, name>
 */
async function searchTag(word){
    try {
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

        if(data.status === 'error') throw new Error(data.message);

        // Mapに変換
        return new Map(Object.entries(data.results));
    } catch (error) {
        return new Map();
    }
}

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