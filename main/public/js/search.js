

// 検索欄でEntarキー
document.getElementById('input-keyword').addEventListener('input',() => {
});
document.getElementById('input-keyword').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
    }
});

let preWords = [];

function arrayEqual(a, b) {
  if (a.length !== b.length) return false;
  return a.every((val, index) => val === b[index]);
}

    // // 先頭の1つ以外を削除
    // while (ul.children.length > 1) {
    //     ul.removeChild(ul.lastElementChild);
    // }
    //     ul.dataset.setTag = 'false';

// タグサジェスト欄作成 
function updateTagSuggests(tags){
    const ul = document.getElementById('keyword-suggests');
    ul.innerHTML = '';
    if(tags.length === 0) return;
}

// タグサジェスト欄破棄
function clearTagSuggests(){
    const ul = document.getElementById('keyword-suggests');
    ul.innerHTML = '';
}

document.getElementById('input-tag').addEventListener('input', async (event) => {
    const text = event.target.value;

    /// 空白を削除
    const words = text.split(/[\s\u3000]/ug).filter(phrase => phrase.trim() !== '');

    // 前回の検索との比較
    if(arrayEqual(preWords, words)){
        return;
    }

    preWords = words;

    // キーワードなし
    if(words.length === 0){
        // 結果欄の削除
        updateTagSuggests({});
        return;
    }

    // とりあえず一つ目だけ
    const word_ = words[0];

    // 中間一致検索
    const results = await searchTag(word_);
    updateTagSuggests(results);
});

// タグの検索
/**
 * 
 * @param {string} word
 * @return {Promise<Map<string, Number>>} 検索結果（タグのMap）<tag, tag_id>
 */
async function searchTag(word){
    try {
        const res = await fetch('/api/search', {
            method:'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                type: 'tag',
                keyword: word
            })
        });

        if(!res.ok) throw new Error(res.status);

        const data = await res.json();
        console.log(data.results);

        if(data.status === 'error') throw new Error(data.message);

        // Mapに変換
        return new Map(Object.entries(data.results));
    } catch (error) {
        return {};
    }
}

document.getElementById('input-tag').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
    }
});