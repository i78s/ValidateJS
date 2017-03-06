"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * ValidityStateオブジェクトを受け取り
 * formのエラー表示をする
 */
var ValidateMessages = (function () {
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
