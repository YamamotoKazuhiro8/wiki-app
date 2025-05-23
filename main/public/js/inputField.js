
// 入力欄

class InputField {
    constructor(id) {
        this.element = document.getElementById(id);
    }

    get value() {
        return this.element.value.trim();
    }

    set value(val) {
        this.element.value = val;
    }

    addEvent(event, callback) {
        this.element.addEventListener(event, callback);
    }

    validate(regex) {
        return regex.test(this.value);
    }

    // 空白区切りで配列を取得
    getWords() {
        return this.value.split(/[\s\u3000]+/ug).filter(v => v.trim() !== '');
    }
}

module.exports = InputField;