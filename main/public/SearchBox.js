

class SearchBox {
    constructor(
        type,
        input_id,
        suggestList_id,
        selectedList_id,
        searchState_id,
        debounceTime
    ) {
        this.previousInput_tag = []; // 前回のタグ欄での検索ワード
        this.selectedTagList = new Map(); // 選択中のタグ<id, name>
        this.tagSearchController = null; // AbortController管理
    
        this.type = type;
        this.input = document.getElementById(input_id);
        this.suggestList = document.getElementById(suggestList_id);
        this.selectedList = document.getElementById(selectedList_id);
        this.searchState = document.getElementById(searchState_id);
        this.debounceTime = debounceTime;

        // 検索欄の入力変更
        document.getElementById(input_id).addEventListener('input', () => this.debounce(this.handleInput.bind(this), debounceTime));
        
    }

    // ーーーメイン処理ーーー

    // タグ入力の処理（debounce適用済みで呼ばれる）
    async andleTagInput() {
        const tags = getInputTags();

        // 前回と同じなら処理しない
        if (arrayEqual(this.previousInput_tag, tags)) return;
        this.previousInput_tag = tags;

        if (tags.length === 0) {
            setSuggested_Tag(new Map());
            setSearchState_tag('close');
            return;
        }

        setSearchState_tag('');
        setSuggested_Tag(new Map());

        // 既存リクエストをキャンセル
        if (this.tagSearchController) this.tagSearchController.abort();
        this.tagSearchController = new AbortController();

        try {
            const result = await searchTags(tags);
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
    arrayEqual(a, b) {
        if (a.length !== b.length) return false;
        return a.every((val, index) => val === b[index]);
    }

    // debounce関数
    debounce(func, wait) {
        let timeout;
        return function (...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    // サジェスト用タグボタン作成
    suggestedTag(name, onclick) {
        const button = document.createElement('button');
        button.className = `suggested-item`;
        button.textContent = name;
        button.addEventListener('click', () => onclick(button));
        return button;
    }

    // 選択中タグ表示要素作成
    selectedTag(id, name, onclick) {
        const div = document.createElement('div');
        div.className = `selected-item`;

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

    /**
     * サジェスト欄にタグを追加
     * @param {Map<Number, string>} tags 
     * @return {boolean} 新しいタグを追加できたかどうか
     */
    setSuggested_Tag(tags) {
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
}