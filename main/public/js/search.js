

// 初期化
document.addEventListener('DOMContentLoaded',() => {
    document.getElementById('search-input').addEventListener('input',(e)=>{
        incrementalSearch(e.target.value);
    })
})

function log(text){
    document.getElementById('suggests').textContent = text; 
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
        
        log(results);
    } catch (error) {
        console.log(error.message);
    }
}