// Container.js

// DOMの子要素の追加、削除、取得を扱うクラス
class DomContainer {
    constructor(containerElement) {
        this.containerElement = containerElement; // DOMノード
    }

    append(childElement) {
        this.containerElement.appendChild(childElement);
    }

    remove(childElement) {
        this.containerElement.removeChild(childElement);
    }

    getAll() {
        return Array.from(this.containerElement.children);
    }

    clear() {
        this.containerElement.innerHTML = '';
    }
}

module.exports = DomContainer;