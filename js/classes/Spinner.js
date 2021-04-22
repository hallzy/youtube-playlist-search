import spinnerEl from '../elements/spinnerEl.js'

export default class Spinner {
    constructor() {
        this.el = spinnerEl;
    }

    async wrapAround(func) {
        this.show();
        await func();
        this.hide();
    }

    show() {
        this.el.classList.remove('hidden');
    }

    hide() {
        this.el.classList.add('hidden');
    }
}
