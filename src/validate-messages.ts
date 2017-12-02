/**
 * ValidityStateオブジェクトを受け取り
 * formのエラー表示をする
 */
export default class ValidateMessages {

    private elements: NodeList;
    private error: {
        key?: string;
        element?: HTMLElement;
    };
    private messages: {
        [key: string]: HTMLElement;
    };

    constructor(selector: string) {

        this.elements = document.querySelectorAll(selector);
        this.error = {};
        this.messages = {};

        this.init();
    }

    init() {
        Array.prototype.forEach.call(this.elements, (el: HTMLElement) => {
            let key = el.getAttribute('data-messages');
            this.messages[key] = el;
        });
    }

    update(key: string, validity: ValidityState) {
        let target = this.messages[key];
        if (!target) {
            return;
        }

        let messages: NodeList = target.children;
        let len = messages.length;
        let isValid: boolean = validity.valid;

        this.error = {};

        while (len--) {
            let message = <HTMLElement>messages[len];
            this.toggleClass(message, 'is-show', false);

            if (isValid) continue;
            let key = message.getAttribute('data-message');
            if (!validity[key]) continue;
            this.error = {
                key: key,
                element: message
            };
        }

        if (this.error.key) {
            this.toggleClass(this.error.element, 'is-show', true);
        }
    }

    toggleClass(element: HTMLElement, className: string, force?: boolean) {
        if (typeof force === 'undefined') {
            element.classList.toggle(className);
            return;
        }
        let method = force ? 'add' : 'remove';
        element.classList[method](className);
    }
}
