
// ・タグ入力(wait) -> タグSuggest -> タグ選択 -> 選択済みタグ欄に追加(wait) -> タグ選択解除 -----↓ 
//                                                          L---------------------------> Page検索  
//                                                 ・タイトル検索入力(wait) -------------------↑ 
//                                                    ・本文検索入力(wait)  -------------------↑
 
// ページ検索イベント発行

const ids = require ('./domIDs');
const {debounce} = require('./utils');
const {getById} = require('./domUtils');
const InputField = require ('./inputField');
const SearchService = require('./searchService');

// 初期化
document.addEventListener('DOMContentLoaded',() => {
    const tagInput = new InputField(getById(ids.TAG_INPUT));
    const tagSearchService = new SearchService(
        () => {}, // successCallback
        () => {}, // noDataCallback
        () => {}, // errorCallback
        () => {}  // cancelCallback
    );
    const debounceTagSearch = debounce(() => {
        tagSearchService.search({
            type: 'tag', slugs: tagInput.getWords()
        })
    },200)
    tagInput.addEvent('input', debounceTagSearch);

    const titleInput = new InputField(getById(ids.TITLE_INPUT));
})