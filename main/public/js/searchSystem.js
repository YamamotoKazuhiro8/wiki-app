
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

const selectedTags = new Map(); //Map<Number, string>

// 初期化
document.addEventListener('DOMContentLoaded',() => {
    const tagSearchService = new SearchService(
        () => { // successCallback
        }, 
        () => {}, // noDataCallback
        () => {}, // errorCallback
        () => {}  // cancelCallback
    );

    const pageSearchService = new SearchService(
        () => {}, // successCallback
        () => {}, // noDataCallback
        () => {}, // errorCallback
        () => {}  // cancelCallback
    );

    // タグ入力
    const tagInput = new InputField(getById(ids.TAG_INPUT));
    const debounceTagInput = debounce(() => {
        const slugs = tagInput.getWords(); // 入力されたタグ
        tagSearchService.search({type: 'tag', slugs: slugs}); 
    }, 200);
    tagInput.addEvent('input', debounceTagInput);

    // タイトル入力
    const titleInput = new InputField(getById(ids.TITLE_INPUT));
    const debounceTitleInput = debounce(() => {
        const titleSlugs = titleInput.getWords();
        const tagIDs = [...selectedTags.keys()];
        pageSearchService.search({type: 'page', titleSlugs: titleSlugs, tagIDs: tagIDs});
    }, 300);
    titleInput.addEvent('input', debounceTitleInput);
})