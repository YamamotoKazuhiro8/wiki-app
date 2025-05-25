
// インライン解析

function inlineProcess(text, ...inlineTypes) {
    const chars = Array.from(text);
    let pos = 0;

    outer: while(pos < chars.length) {
        for(type of inlineTypes){
            const result = type.process(chars, pos);
            if(result.success){
                pos = result.pos;
                continue outer;
            }
        }
        pos++;
    }
}

const inlineType = {
    bold: 'bold',
    italic: 'italic',
    strikethrough: 'strikethrough',
    link: 'link',
    all: 'all',
    none: 'none',
}

// 解析処理
const process = {
    [inlineType.bold]: between('**','**'),
    [inlineType.italic]: between('__','__'),
    [inlineType.strikethrough]: between('~~','~~'),

    [inlineType.link]: (chars, pos) => { // 連続
        const res1 = between('(',')')(chars, pos);
        if(!res1.success) return {success:false};
        
        pos = res1.pos;
        const res2 = between('[',']')(chars, pos);
        if(!res2.success) return {success: false};

        return {success: true, pos: res2.pos, text: `${res1.text}\n${res2.text}`};
    },

    [inlineType.all]: (chars, pos) => { // いずれか
        for (const type of [inlineType.bold, inlineType.italic, inlineType.strikethrough, inlineType.link]) {
            const result = type.process(chars, pos);
            if (result.success) {
                return result;
            }
        }
        return { success: false };
    },

    [inlineType.none]: (chars, pos) => {
        return {success: true, pos: chars.length, text: chars.slice(pos, chars.length).join('')}
    },
}

/**
 * target の特定位置に pattern が一致するかを判定
 * @param {string[]} pattern 
 * @param {string[]} target 
 * @param {number} pos 
 * @returns {boolean}
 */
function matchesAt(patern, target, pos) {
    if(target.length - pos < patern.length) return false;
    for(let i = 0; i < patern.length; i++){
        if(patern[i] !== target[pos + i]) {
            return false;
        }
    }
    return true;
}

/**
 * 指定された開始文字列と終了文字列に囲まれた文字列を抽出する関数を返す
 * @param {string} left - 開始の文字列
 * @param {string} right - 終了の文字列
 * @returns {object} sucess, pos(次の始点), text(記号を除いた内容)
 */
function between(left, right) {
    return function(target, pos) {
        const leftChars = Array.from(left);

        if(!matchesAt(leftChars, target, pos)) return {success: false};

        const rightChars = Array.from(right);
        
        const start = pos + leftChars.length;
        pos = start;

        while(pos < target.length){
            if(matchesAt(rightChars, target, pos)){
                return {
                    success: true, 
                    pos: pos + rightChars.length,
                    text: target.slice(start, pos).join('')
                };
            }
            pos++;
        }

        return { success: false };
    }
}

module.export = {inlineType, process: inlineProcess};
// /**
//  * targer内のposから始まり、textで囲まれた部分を探す
//  * @param {string[]} target - 対象文字列
//  * @param {string} pattern - 開始・終了の区切り文字列（例: ['*', '*']）
//  * @param {number} pos - 開始位置
//  * @returns {object} 結果オブジェクト
//  */
// function between(pattern, target, pos) {
//     const patternChars = Array.from(pattern);
//     if(!matchesAt(patternChars, target, pos)) return {success: false};
    
//     const start = pos + patternChars.length;
//     pos = start;

//     while(pos < target.length){
//         if(matchesAt(patternChars, target, pos)){
//             return {
//                 success: true, 
//                 pos: pos + patternChars.length,
//                 text: target.slice(start, pos).join('')
//             };
//         }
//         pos++;
//     }

//     return { success: false };
// }

// /**
//  * target内のposから始まり、leftとrightで囲まれた部分を探す
//  * @param {string} left - 開始の区切り文字列（例: '('）
//  * @param {string} right - 終了の区切り文字列（例: ')'）
//  * @param {string[]} target - 対象文字列
//  * @param {number} pos - 開始位置
//  * @returns {object} 結果オブジェクト { success, pos, text }
//  */
// function between(left, right, target, pos) {
//     const leftChars = Array.from(left);

//     if(!matchesAt(leftChars, target, pos)) return {success: false};

//     const rightChars = Array.form(right);
    
//     const start = pos + leftChars.length;
//     pos = start;

//     while(pos < target.length){
//         if(matchesAt(rightChars, target, pos)){
//             return {
//                 success: true, 
//                 pos: pos + rightChars.length,
//                 text: target.slice(start, pos).join('')
//             };
//         }
//         pos++;
//     }

//     return { success: false };
// }