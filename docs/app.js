/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = __webpack_require__(1);
var validateMessages = new index_1.ValidateMessages('.js-validate-messages');
var validate = new index_1.default('form', {
    customValidate: {
        password: function (element, form) {
            this.trigger('change', form['passwordConfirm']);
        },
        passwordConfirm: function (element, form) {
            if (element.value !== form['password'].value) {
                element.setCustomValidity('パスワードが一致しません');
                return;
            }
            element.setCustomValidity('');
        }
    },
    onCheckHandler: function (element, validity) {
        var parent = element.parentNode;
        validateMessages.update(element.name, validity);
        validateMessages.toggleClass(parent, 'has-success', validity.valid);
        validateMessages.toggleClass(parent, 'has-error', !validity.valid);
    },
    onSubmitHandler: function () {
        alert('submit');
    }
});


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var validate_1 = __webpack_require__(2);
var validate_messages_1 = __webpack_require__(3);
exports.ValidateMessages = validate_messages_1.default;
exports.default = validate_1.default;


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var Validate = /** @class */ (function () {
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
        // IEでselectのvalidityの値の反映が遅れるバグの回避
        // https://github.com/travis-ci/emberx-select/commit/4d85d0ac9665ef27c60f9188a7b29199f930b10f
        if (target.nodeName === 'SELECT') {
            var value = target.value;
            e.target.value = 'ie-hack';
            e.target.value = value;
        }
        var customValidate = this.option.customValidate[target.name];
        if (customValidate) {
            customValidate.apply(this, [target, this.form]);
        }
        this.option.onCheckHandler.apply(this, [target, e.target.validity]);
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


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * ValidityStateオブジェクトを受け取り
 * formのエラー表示をする
 */
var ValidateMessages = /** @class */ (function () {
    function ValidateMessages(selector) {
        this.elements = document.querySelectorAll(selector);
        this.error = {};
        this.messages = {};
        this.init();
    }
    ValidateMessages.prototype.init = function () {
        var _this = this;
        Array.prototype.forEach.call(this.elements, function (el) {
            var key = el.getAttribute('data-messages');
            _this.messages[key] = el;
        });
    };
    ValidateMessages.prototype.update = function (key, validity) {
        var target = this.messages[key];
        if (!target) {
            return;
        }
        var messages = target.children;
        var len = messages.length;
        var isValid = validity.valid;
        this.error = {};
        while (len--) {
            var message = messages[len];
            this.toggleClass(message, 'is-show', false);
            if (isValid)
                continue;
            var key_1 = message.getAttribute('data-message');
            if (!validity[key_1])
                continue;
            this.error = {
                key: key_1,
                element: message
            };
        }
        if (this.error.key) {
            this.toggleClass(this.error.element, 'is-show', true);
        }
    };
    ValidateMessages.prototype.toggleClass = function (element, className, force) {
        if (typeof force === 'undefined') {
            element.classList.toggle(className);
            return;
        }
        var method = force ? 'add' : 'remove';
        element.classList[method](className);
    };
    return ValidateMessages;
}());
exports.default = ValidateMessages;


/***/ })
/******/ ]);