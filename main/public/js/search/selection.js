
const {getById} = require('./domUtils');

class Selection {

    constructor(...options) {
        this.options = options;
        this.current = '';
    }

    add(id, show = false) {
        this.options[id] = getById(id);
        if(show) {
            show(id); 
            return;
        }
        this.options[id].classList.add('hidden');
    }

    show(id) {
        if(this.current !== '') this.options[this.current].classList.add('hidden');

        this.options[id].classList.remove('hidden');
        this.current = id;
    }
}

module.exports = Selection;