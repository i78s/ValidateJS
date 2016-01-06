interface ValidateOption {
    customValidate?: {
        [key: string]: (element: HTMLInputElement | HTMLSelectElement, form: HTMLFormElement) => {};
    }
    onCheckHandler?(element: HTMLInputElement | HTMLSelectElement, validity: ValidityState): void;
    onSubmitHandler?(): void;
}

export default class Validate {

    static noop(): void { }

    private form: HTMLFormElement;
    private submitBtn: HTMLButtonElement;
    option: ValidateOption;
    private _submitHandler: (e: Event) => void;
    private _changeHandler: (e: Event) => void;
    private _inputHandler: (e: Event) => void;

    constructor(element: HTMLFormElement, option: ValidateOption);
    constructor(element: string, option: ValidateOption);
    constructor(
        element: any,
        option: ValidateOption = {}
    ) {

        this.form = element;

        if (typeof element === "string") {
            this.form = <HTMLFormElement>document.getElementById(element);
        }

        this.submitBtn = <HTMLButtonElement>this.form.querySelector('button');

        this.option = this.extend({
            customValidate: {},
            onCheckHandler: Validate.noop,
            onSubmitHandler: Validate.noop
        }, option);

        this._changeHandler = (e: Event) => {
            this.update(e);
        };
        this._inputHandler = (e: Event) => {
            this.update(e);
        };
        this._submitHandler = (e: Event) => {
            if (!this.isValid()) return;
            e.preventDefault();
            this.submit();
        };

        this.init();
    }

    /**
     * formの監視を開始する
     */
    init() {
        this.form.addEventListener('change', this._changeHandler);
        this.form.addEventListener('input', this._inputHandler);
        this.form.addEventListener('submit', this._submitHandler);
    }

    /**
     * formのバリデーションが通っているかを返す
     * @returns {boolean}
     */
    isValid(): boolean {
        return this.form.checkValidity();
    }
    /**
     * formの変更を元に画面を更新する
     * @param e
     */
    update(e: Event) {
        let target: any = e.target;
        target.classList.add('is-dirty');

        let customValidate = this.option.customValidate[target.name];
        if (customValidate) {
            customValidate.apply(this, [target, this.form]);
        }

        this.option.onCheckHandler.apply(this, [target, target.validity]);

        if (this.form.checkValidity()) {
            this.disabled(false);
            return;
        }
        this.disabled(true);
    }

    /**
     * changeイベントを強制発火させる
     * @param element
     */
    trigger(event: string, element: HTMLInputElement | HTMLSelectElement) {
        let e = document.createEvent('HTMLEvents');
        e.initEvent(event, true, true);
        element.dispatchEvent(e);
    }

    /**
     * 送信ボタンのdisabledを切り替える
     * @param bool
     */
    disabled(bool: boolean) {
        if (bool) {
            this.submitBtn.setAttribute('disabled', 'disabled');
            return;
        }
        this.submitBtn.removeAttribute('disabled');
    }

    /**
     * formを送信する
     * オプションでonSubmitHandlerが設定されていなければform.submitを発火する
     */
    submit() {
        if (!this.isValid()) {
            return;
        }

        if (this.option.onSubmitHandler !== Validate.noop) {
            this.option.onSubmitHandler.apply(this, []);
            return;
        }
        this.form.submit();
    }

    destroy() {
        this.form.removeEventListener('change', this._changeHandler);
        this.form.removeEventListener('input', this._inputHandler);
        this.form.removeEventListener('submit', this._submitHandler);
    }

    extend(obj: any = {}, ...src: any[]): any {
        if (arguments.length < 2) {
            return obj;
        }
        for (var i = 1; i < arguments.length; i++) {
            for (var key in arguments[i]) {
                if (arguments[i][key] !== null && typeof (arguments[i][key]) === "object") {
                    obj[key] = this.extend(obj[key], arguments[i][key]);
                } else {
                    obj[key] = arguments[i][key];
                }
            }
        }
        return obj;
    }
}
