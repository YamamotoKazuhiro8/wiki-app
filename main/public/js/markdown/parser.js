
// Markdown -> HTML 変換

function parse(markdown) {
    const lines = text.split('\n');
    const results = [];

    let state = states.NORMAL;
    let row = 0;
    while(row < lines.length) {
        const line = lines[row];

        // 行の解析 
        const result = lineParsers[state](line);

        // ASTの作成

        // 状態の遷移
        state = result.state;

        row++;
    }

    // 
}

// 解析状態
const states = {
    NORMAL: 'NORMAL',
    H2: 'H2',
    H3: 'H3',
    LIST: 'LIST',
    CODE: 'CODE',
};

// 行タイプ
const lineType = {
    NORMAL: 'NORMAL',
    H2_HEADER: 'H2_HEADER',
    H2_CONTENT: 'H2_CONTENT',
    H3_HEADER : 'H3_HEADER',
    H3_CONTENT: 'H3_CONTENT',
    LIST_ITEM: 'LIST_ITEM',
    BLOCKQUOTE: 'BLOCKQUOTE',
};

// 行先頭解析
const match = {
    h2 : (line) => {
        return line.startsWith('## ');
    },
    h3 : (line) => {
        return line.startsWith('### ');
    },
}

// 行解析器
const lineParsers = {
    [states.NORMAL]: (line) => {
        switch(true) {
            case match.h2(line):
                return createResult(states.H2, lineType.H2_HEADER, inlineProcess.h2_header(line));
            case match.h3(line):
                return createResult(states.H3, lineType.H3_HEADER, inlineProcess.h3_header(line));
            default:
                return createResult(states.NORMAL, lineType.NORMAL, inlineProcess.linkOnly(line));
        }
    },
    [states.H2]: (line) => {
        switch(true) {
            case match.h2(line):
                return createResult(states.H2, lineType.H2_HEADER, inlineProcess.h2_header(line));
            case match.h3(line):
                return createResult(states.H3, lineType.H3_HEADER, inlineProcess.h3_header(line));
            default:
                return createResult(states.H2, lineType.H2_CONTENT, inlineProcess.normal(line));
        }
    },
    [states.H3]: (line) => {},
    [states.LIST]: (line) => {},
    [states.CODE]: (line) => {}
}

// インライン解析
const inlineProcess = {
    noProcss: (line) => {
        return line;
    },


    italic: (line) => {
    },
    linkOnly: (line) => {
    },
    normal: (line) => {
    },


    h2_header: (line) => {
        return line.slice(3).trim();
    },
    h3_header: (line) => {
        return line.slice(4).trim();
    },
}

// 行解析結果
function createResult(state, type, text){
    return {
        state: state,
        type: type,
        text: text
    }
}