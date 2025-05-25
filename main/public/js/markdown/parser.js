
// Markdown -> HTML 変換

// StateMachineベース

const {inlineProcess, inlineType} = require('./lexer'); // インライン解析器

function parse(markdown) {
    const lines = text.split('\n');

    let state = states.NORMAL;
    let row = 0;
    while(row < lines.length) {
        const line = lines[row];

        // 状態遷移
        const newState = stateTransition[state](line);
        // 解析
        const result = process[newState](line);

        // ASTの作成

        // 状態の遷移
        state = newState.state;

        row++;
    }

    // 
}

// 解析状態
const states = {
    NORMAL: 'NORMAL',
    Section: 'Section',
    LIST: 'LIST',
    CODE: 'CODE',
    TABLE: 'TABLE',
};

// 行頭解析
const match = {
    section : (line) => {
        return line.startsWith('## ');
    },
}

// 行頭を読んで状態遷移
// 上の行の状態を受け取る
const stateTransition = {
    [states.NORMAL]: (line) => {
        switch(true) {
            case match.section(line): return states.Section;
            default: return states.NORMAL;
        }
    },
    [states.Section]: (line) => {
        switch(true) {
            case match.section(line): return states.Section;
            default: return states.NORMAL;
        }
    },
    [states.LIST]: (line) => {},
    [states.CODE]: (line) => {}
}

// 解析処理
const process = {
    [states.NORMAL]: { state: states.NORMAL, text: inlineProcess(line, inlineType.all) },
    [states.Section]: { state: states.Section, text: inlineProcess(line.slice(3), inlineType.link) },
    [states.LIST]: (line) => {},
    [states.CODE]: (line) => {}
}