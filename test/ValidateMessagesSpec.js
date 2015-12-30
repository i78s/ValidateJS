import ValidateMessages from '../lib/ValidateMessages';

describe('ValidateMessages', () => {

    let validateMessages;
    let ValidityState = {
        rangeOverflow: false,
        rangeUnderflow: false,
        stepMismatch: false,
        tooShort: false,
        typeMismatch: false,
        valueMissing: true,
        customError: false,
        patternMismatch: false,
        tooLong: false,
        valid: true,
        badInput: false
    };

    let name;
    let email;
    let password;

    function extend(obj, src) {
        for(let key in src) {
            obj[key] = src[key];
        }
        return obj;
    }

    beforeEach(() => {
        document.body.innerHTML = __html__["test/fixtures/ValidateMessages.html"];
        validateMessages = new ValidateMessages('.js-messages');

        let $name = document.querySelector('[data-messages="name"]');
        let $email = document.querySelector('[data-messages="email"]');
        let $password = document.querySelector('[data-messages="password"]');

        name = {
            valueMissing: $name.querySelector('[data-message="valueMissing"]'),
            tooShort: $name.querySelector('[data-message="tooShort"]')
        };
        email = {
            valueMissing: $email.querySelector('[data-message="valueMissing"]'),
            typeMismatch: $email.querySelector('[data-message="typeMismatch"]')
        };
        password = {
            tooShort: $password.querySelector('[data-message="tooShort"]'),
            patternMismatch: $password.querySelector('[data-message="patternMismatch"]'),
            customError: $password.querySelector('[data-message="customError"]')
        };
    });

    afterEach(() => {});

    it('member', () => {
        let properties = [
            'elements',
            'error',
            'messages'
        ];
        let methods = [
            'init',
            'update',
            'toggleClass'
        ];

        // properties & methods
        for (let i = 0, len = properties.length; i < len; i++) {
            assert(validateMessages[properties[i]] !== undefined);
        }
        for (let i = 0, len = methods.length; i < len; i++) {
            assert(typeof validateMessages[methods[i]] === 'function');
        }
    });

    describe('update', () => {

        it('classNameの付け替え', () => {
            let state = extend(ValidityState, {
                valid: false,
                valueMissing: true
            });

            assert(name.valueMissing.classList.contains('is-show') === false);
            assert(name.tooShort.classList.contains('is-show') === false);
            assert(email.valueMissing.classList.contains('is-show') === false);
            assert(email.typeMismatch.classList.contains('is-show') === false);

            validateMessages.update('name', state);
            assert(name.valueMissing.classList.contains('is-show') === true);
            assert(name.tooShort.classList.contains('is-show') === false);
            assert(email.valueMissing.classList.contains('is-show') === false);
            assert(email.typeMismatch.classList.contains('is-show') === false);

            validateMessages.update('email', state);
            assert(name.valueMissing.classList.contains('is-show') === true);
            assert(name.tooShort.classList.contains('is-show') === false);
            assert(email.valueMissing.classList.contains('is-show') === true);
            assert(email.typeMismatch.classList.contains('is-show') === false);

            state = extend(ValidityState, {
                valid: false,
                valueMissing: false,
                typeMismatch: true
            });
            validateMessages.update('email', state);
            assert(name.valueMissing.classList.contains('is-show') === true);
            assert(name.tooShort.classList.contains('is-show') === false);
            assert(email.valueMissing.classList.contains('is-show') === false);
            assert(email.typeMismatch.classList.contains('is-show') === true);

            state = extend(ValidityState, {
                valid: true,
                valueMissing: false
            });
            validateMessages.update('name', state);
            assert(name.valueMissing.classList.contains('is-show') === false);
            assert(name.tooShort.classList.contains('is-show') === false);
            assert(email.valueMissing.classList.contains('is-show') === false);
            assert(email.typeMismatch.classList.contains('is-show') === true);
        });

        it('表示するメッセージは1つのみ', () => {
            let state = extend(ValidityState, {
                valid: false,
                tooShort: true,
                patternMismatch: true,
                customError: true
            });
            validateMessages.update('password', state);

            let count = 0;
            for(let key in password) {
                if(password[key].classList.contains('is-show')) {
                    count++;
                }
            }
            assert(count === 1);
        });
    });

    it('toggleClass', () => {
        let element = name.valueMissing;

        assert(element.classList.contains('is-show') === false);
        validateMessages.toggleClass(element, 'is-show');
        assert(element.classList.contains('is-show') === true);
        validateMessages.toggleClass(element, 'is-show');
        assert(element.classList.contains('is-show') === false);

        validateMessages.toggleClass(element, 'is-show', true);
        assert(element.classList.contains('is-show') === true);
    });

});
