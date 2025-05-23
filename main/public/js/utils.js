// utils.js

// エラー作成
function err(status, message){
    const err = new Error(message);
    err.status = status;
    return err;
}

// 配列の比較（単純な値の一致）
function arrayEqual(a, b) {
    if (a.length !== b.length) return false;
    return a.every((val, index) => val === b[index]);
}

// debounce関数
function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

module.exports = { err, arrayEqual, debounce };

