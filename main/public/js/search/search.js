
// ・タグ入力(wait) -> タグSuggest -> タグ選択 -> 選択済みタグ欄に追加(wait) -> タグ選択解除 -----↓ 
//                                                          L---------------------------> Page検索  
//                                                 ・タイトル検索入力(wait) -------------------↑ 
//                                                    ・本文検索入力(wait)  -------------------↑
 
// ページ検索イベント発行

// 次 callBack関数

const ids = require ('./domIDs');
const {err, debounce} = require('./utils');
const {getById} = require('./domUtils');
const InputField = require ('./inputField');
const DomContainer = require('./domContainer');
const Selection = require('./selection');

// 初期化
document.addEventListener('DOMContentLoaded',() => {
    // タグ入力
    const tagInput = new InputField(getById(ids.TAG_INPUT));
    // タイトル入力
    const titleInput = new InputField(getById(ids.TITLE_INPUT));

    const tagSearchStatusSelection = new Selection(
        ids.TAG_SEARCH_STATUS_CLOSE,
        ids.TAG_SEARCH_STATUS_LOADING,
        ids.TAG_SEARCH_STATUS_NODATA,
        ids.TAG_SEARCH_STATUS_ERROR
    );
    tagSearchStatusSelection.show(ids.TAG_SEARCH_STATUS_CLOSE);

    // タグサジェスト
    const tagSuggests = new DomContainer(getById(ids.TAG_SUGGETS));

    // 選択されたタグ
    const selectedTags = new DomContainer(getById(ids.TAG_SELECTED_LIST));

    // ページ検索結果
    const pageSuggests = new DomContainer(getById(ids.PAGE_SUGGESTS));

    // タグ入力処理
    const tagSearchHandler = createSearchHandler({
        beforeSearch: () => {
            tagSuggests.clear(); // サジェスト欄のクリア
            tagSearchStatusSelection.show(ids.TAG_SEARCH_STATUS_LOADING); // ローディング表示
        },
        onSuccess: (data) => {
        },
        onNoData: () => {
            tagSearchStatusSelection.show(ids.TAG_SEARCH_STATUS_NODATA);
        },
        onError: (error) => {
            tagSearchStatusSelection.show(ids.TAG_SEARCH_STATUS_ERROR);
        },
        onCancel: () => {}
    });

    // ページ検索処理
    const pageSearchHandler = createSearchHandler({
        onSuccess: (data)  => {
            pageSuggests.clear();
        },
        onNoData: ()       => {
        },
        onError: (error)   => {},
        onCancel: ()       => {}
    });

    // タグ入力に変更
    tagInput.addEvent('input', debounce(() => {
        const slugs = tagInput.getWords(); // 入力されたタグ
        tagSearchHandler({type: 'tag', slugs: slugs}); 
    }, 200));

    // タイトル入力に変更
    titleInput.addEvent('input', debounce(() => {
        const titleSlugs = titleInput.getWords();
        const tagIDs = selectedTags.getAll();
        pageSearchHandler({type: 'page', titleSlugs: titleSlugs, tagIDs: tagIDs});
    }, 300));

    // 初回検索
    const titleSlugs = titleInput.getWords();
    const tagIDs = selectedTags.getAll();
    pageSearchHandler({type: 'page', titleSlugs: titleSlugs, tagIDs: tagIDs});
})

const resultStatus = {
    NO_DATA : 'noData',
    ERROR   : 'error',
    SUCCESS : 'success' 
};

function createSearchHandler({ beforeSearch, onSuccess, onNoData, onError, onCancel }) {
    let controller = null;
    let prevBodyData = null;

    return async function search(bodyData) {
        const currentBodyData = JSON.stringify(bodyData);
        if(prevBodyData === currentBodyData) {
            console.log("同じ内容なのでスキップ");
            return;
        }

        prevBodyData = currentBodyData;

        if (controller) controller.abort();  // 前回の検索を中断
        controller = new AbortController();

        beforeSearch();

        try {
            const res = await fetch('/api/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: currentBodyData,
                signal: controller.signal,
            });

            if (!res.ok) throw err('error', `${res.status}:${res.statusText}`);

            const data = await res.json();

            if (data.status === resultStatus.NO_DATA) {
                onNoData();
            } else {
                onSuccess(data);
            }
        } catch (error) {
            if (error.name === 'AbortError') {
                onCancel();
            } else {
                onError(error);
            }
        }
    };
}