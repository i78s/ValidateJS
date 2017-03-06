"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Validate = (function () {
    function Validate(element, option) {
        if (option === void 0) { option = {}; }
        var _this = this;
        this.form = element;
        if (typeof element === "string") {
            this.form = document.getElementById(element);
        }
        this.submitBtn = this.form.querySelector('button');
        this.option = this.extend({
            customValidate: {},
            onCheckHandler: Validate.noop,
            onSubmitHandler: Validate.noop
        }, option);
        this._changeHandler = function (e) {
            _this.update(e);
        };
        this._inputHandler = function (e) {
            _this.update(e);
        };
        this._submitHandler = function (e) {
            if (!_this.isValid())
                return;
            e.preventDefault();
            _this.submit();
        };
        this.init();
    }
    Validate.noop = function () { };
    /**
     * formの監視を開始する
     */
    Validate.prototype.init = function () {
        this.form.addEventListener('change', this._changeHandler);
        this.form.addEventListener('input', this._inputHandler);
        this.form.addEventListener('submit', this._submitHandler);
    };
    /**
     * formのバリデーションが通っているかを返す
     * @returns {boolean}
     */
    Validate.prototype.isValid = function () {
        return this.form.checkValidity();
    };
    /**
     * formの変更を元に画面を更新する
     * @param e
     */
    Validate.prototype.update = function (e) {
        var target = e.target;
        target.classList.add('is-dirty');
        var customValidate = this.option.customValidate[target.name];
        if (customValidate) {
            customValidate.apply(this, [target, this.form]);
        }
        this.option.onCheckHandler.apply(this, [target, target.validity]);
        if (this.form.checkValidity()) {
            this.disabled(false);
            return;
        }
        this.disabled(true);
    };
    /**
     * changeイベントを強制発火させる
     * @param element
     */
    Validate.prototype.trigger = function (event, element) {
        var e = document.createEvent('HTMLEvents');
        e.initEvent(event, true, true);
        element.dispatchEvent(e);
    };
    /**
     * 送信ボタンのdisabledを切り替える
     * @param bool
     */
    Validate.prototype.disabled = function (bool) {
        if (bool) {
            this.submitBtn.setAttribute('disabled', 'disabled');
            return;
        }
        this.submitBtn.removeAttribute('disabled');
    };
    /**
     * formを送信する
     * オプションでonSubmitHandlerが設定されていなければform.submitを発火する
     */
    Validate.prototype.submit = function () {
        if (!this.isValid()) {
            return;
        }
        if (this.option.onSubmitHandler !== Validate.noop) {
            this.option.onSubmitHandler.apply(this, []);
            return;
        }
        this.form.submit();
    };
    Validate.prototype.destroy = function () {
        this.form.removeEventListener('change', this._changeHandler);
        this.form.removeEventListener('input', this._inputHandler);
        this.form.removeEventListener('submit', this._submitHandler);
    };
    Validate.prototype.extend = function (obj) {
        if (obj === void 0) { obj = {}; }
        var src = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            src[_i - 1] = arguments[_i];
        }
        if (arguments.length < 2) {
            return obj;
        }
        for (var i = 1; i < arguments.length; i++) {
            for (var key in arguments[i]) {
                if (arguments[i][key] !== null && typeof (arguments[i][key]) === "object") {
                    obj[key] = this.extend(obj[key], arguments[i][key]);
                }
                else {
                    obj[key] = arguments[i][key];
                }
            }
        }
        return obj;
    };
    return Validate;
}());
exports.default = Validate;
