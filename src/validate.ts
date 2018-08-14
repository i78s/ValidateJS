interface HTMLElementEvent<T extends HTMLElement> extends Event {
    target: T;
}

interface ValidateOption {
    customValidate?: {
        [key: string]: (element: HTMLInputElement | HTMLSelectElement, form: HTMLFormElement) => void;
    }
    onCheckHandler?(element: HTMLInputElement | HTMLSelectElement, validity: ValidityState): void;
    onSubmitHandler?(): void;
}

export default class Validate {

    static noop(): void { }

    private form: HTMLFormElement;
    private submitBtn: HTMLButtonElement;
    option: ValidateOption;
    private _submitHandler: (e: HTMLElementEvent<HTMLInputElement>) => void;
    private _changeHandler: (e: HTMLElementEvent<HTMLInputElement>) => void;
    private _inputHandler: (e: HTMLElementEvent<HTMLInputElement>) => void;

    constructor(element: HTMLFormElement, option?: ValidateOption);
    constructor(element: string, option?: ValidateOption);
    constructor(
        element: any,
        option: ValidateOption = {}
    ) {

        this.form = element;

        if (typeof element === "string") {
            this.form = document.getElementById(element) as HTMLFormElement;
        }

        this.submitBtn = this.form.querySelector('button') as HTMLButtonElement;

        this.option = {
            customValidate: {},
            onCheckHandler: Validate.noop,
            onSubmitHandler: Validate.noop,
            ...option,
        };

        this._changeHandler = (e: HTMLElementEvent<HTMLInputElement>) => {
            this.update(e);
        };
        this._inputHandler = (e: HTMLElementEvent<HTMLInputElement>) => {
            this.update(e);
        };
        this._submitHandler = (e: HTMLElementEvent<HTMLInputElement>) => {
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
    update(e: HTMLElementEvent<HTMLInputElement>) {
        let target = e.target;
        target.classList.add('is-dirty');

        // IEでselectのvalidityの値の反映が遅れるバグの回避
        // https://github.com/travis-ci/emberx-select/commit/4d85d0ac9665ef27c60f9188a7b29199f930b10f
        if( target.nodeName === 'SELECT'){
            const value = target.value;
            e.target.value = 'ie-hack';
            e.target.value = value;
        }

        let customValidate = this.option.customValidate[target.name];
        if (customValidate) {
            customValidate.apply(this, [target, this.form]);
        }

        this.option.onCheckHandler.apply(this, [target, e.target.validity]);

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
    trigger(event: string, element: HTMLInputElement | HTMLSelectElement | HTMLFormElement) {
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
}
