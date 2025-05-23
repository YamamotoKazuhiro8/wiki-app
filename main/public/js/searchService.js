// searchService.js

const {err} = require('./utils');

const resultStatus = {
    NO_DATA : 'noData',
    ERROR   : 'error',
    SUCCESS : 'success' 
};

// 非同期で検索を行う
class SearchService {
    constructor(successCallback, noDataCallback, errorCallback, cancelCallback){
        this.searchController = null;
        this.successCallback = successCallback;
        this.noDataCallback = noDataCallback;
        this.errorCallback = errorCallback;
        this.cancelCallback = cancelCallback;
    }

    search = async (bodyData) => {
        if (this.searchController) {
            this.searchController.abort();  // 前の検索をキャンセル
        }

        this.searchController = new AbortController();

        try {
            const res = await fetch('/api/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bodyData),
                signal: this.searchController.signal,
            });

            if (!res.ok) throw err(res.status, res.statusText);

            const data = await res.json();

            if (data.status === resultStatus.NO_DATA) { 
                this.noDataCallback(data);
                return;
            }

            this.successCallback(data);
        } catch (error) {
            if(error.name === 'AbortError') {
                this.cancelCallback();
                return;
            }
            this.errorCallback(error);
        }
    }
}

module.exports = SearchService;