
// 初期化
document.addEventListener('DOMContentLoaded',() => {
    DOMs.search_input().addEventListener('input',(e)=>{
        incrementalSearch(e.target.value);
    })
})

class DOMs {
    static search_input(){
        return document.getElementById('search-input');
    }
}

// ['HTML','CSS', ...]
/**
 * 
 * @param {string[]} data 
 */
function updateSuggests(data) {
    const ul = document.getElementById('suggests-list');
    ul.innerHTML = '';
    data.forEach((tag) => {
        const li = document.createElement('li');
        li.id = tag;
        li.textContent = tag;
        li.addEventListener('click',()=>{
            DOMs.search_input().value = '#' + tag; 
            DOMs.search_input().dispatchEvent(new Event('input'));
        });
        ul.appendChild(li);
    });
}

// インクリメンタルサーチ
async function incrementalSearch(keyword){
    // #(半角)で始まる
    if(keyword.length <= 1 || !keyword.startsWith('#'))
        return;

    const tag = keyword.slice(1);
    try {
        // タグ検索
        const res = await fetch('/api/search', {
            method:'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                type: 'tag',
                keyword: tag
            })
        });

        if(!res.ok) throw new Error(res.status);

        const data = await res.json();

        if(data.status === 'error') throw new Error(data.message);

        const results = data.results;
        
        updateSuggests(results);
    } catch (error) {
        console.log(error.message);
    }
}