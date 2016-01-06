import Validate from '../lib/Validate';

describe('Validate', () => {

    let validate;
    let $form;
    let $submit;

    let spy = {};

    beforeEach(() => {
        // document.body.innerHTML = __html__["test/fixtures/index.html"];
        document.body.innerHTML = `<form id="form"><input type="text" name="text" required><button type="submit" disabled="disabled">送信</button></form>`;

        $form = document.getElementById('form');
        $submit = $form.querySelector('button');

        validate = new Validate($form);

        spy.update = sinon.spy(validate, 'update');
        spy.submit = sinon.spy(validate, 'submit');
    });

    afterEach(() => {
        validate.destroy();
    });

    it('member', () => {
        let properties = [
            'form',
            'option',
            'submitBtn'
        ];
        let methods = [
            '_submitHandler',
            '_changeHandler',
            '_inputHandler',
            'init',
            'isValid',
            'update',
            'trigger',
            'disabled',
            'submit',
            'destroy',
            'extend'
        ];

        // properties & methods
        for (let i = 0, len = properties.length; i < len; i++) {
            assert(validate[properties[i]] !== undefined);
        }
        for (let i = 0, len = methods.length; i < len; i++) {
            assert(typeof validate[methods[i]] === 'function');
        }

        // static
        assert(typeof Validate.noop === 'function');

        // option
        assert(typeof validate.option.customValidate === 'object');
        assert(validate.option.onCheckHandler === Validate.noop);
        assert(validate.option.onSubmitHandler === Validate.noop);
    });

    it('init', () => {
        // DOM
        assert($form.outerHTML.replace(/\n|\t/g, '') === '<form id="form"><input type="text" name="text" required=""><button type="submit" disabled="disabled">送信</button></form>');
        assert(validate.submitBtn.outerHTML.replace(/\n|\t/g, '') === '<button type="submit" disabled="disabled">送信</button>')

        // Event
        validate.trigger('input', $form.text);
        assert(spy.update.callCount === 1);
        validate.trigger('change', $form.text);
        assert(spy.update.callCount === 2);

        // ボタンがdisabledだとsubmitイベントは発火しないらしい
        validate.trigger('submit', $form);
        assert(spy.submit.callCount === 0);

        $form.text.value = 'あいうえお';
        validate.trigger('input', $form.text);
        validate.trigger('submit', $form);
        assert(spy.submit.callCount === 1);
    });

    it('isValid', () => {
        assert(validate.isValid() === false);

        $form.text.value = 'あいうえお';
        validate.trigger('input', $form.text);
        assert(validate.isValid() === true);
    });

    it('disabled', () => {
        validate.disabled(false);
        assert($submit.getAttribute('disabled') === null);

        validate.disabled(true);
        assert($submit.getAttribute('disabled') === 'disabled');
    });

    it('trigger', () => {
        validate.trigger('change', $form.text);
        assert(spy.update.callCount === 1);

        validate.trigger('change', $form.text);
        assert(spy.update.callCount === 2);
    });

    describe('update', () => {

        it('一度でも変更されたらis-dirtyクラスをつける', () => {
            assert($form.text.classList.contains('is-dirty') === false);

            $form.text.value = 'あいうえお';
            validate.trigger('input', $form.text);
            assert($form.text.classList.contains('is-dirty'));

            $form.text.value = '';
            validate.trigger('input', $form.text);
            assert($form.text.classList.contains('is-dirty'));
        });

        it('disabled切り替え', () => {
            assert(validate.isValid() === false);
            assert($submit.getAttribute('disabled') === 'disabled');

            $form.text.value = 'あいうえお';
            validate.trigger('input', $form.text);
            assert(validate.isValid() === true);
            assert($submit.getAttribute('disabled') === null);

            $form.text.value = '';
            validate.trigger('input', $form.text);
            assert(validate.isValid() === false);
            assert($submit.getAttribute('disabled') === 'disabled');
        });

        it('onCheckHandler', () => {
            let onCheckHandler = (element, validity) => {};
            validate.option.onCheckHandler = onCheckHandler;
            spy.onCheckHandler = sinon.spy(validate.option, 'onCheckHandler');

            $form.text.value = 'あいうえお';
            validate.trigger('input', $form.text);
            assert(spy.onCheckHandler.callCount === 1);

            $form.text.value = '';
            validate.trigger('input', $form.text);
            assert(spy.onCheckHandler.callCount === 2);

            assert(spy.onCheckHandler.calledWith($form.text, $form.text.validity));  // callbackの引数チェック
        });

        it('カスタムバリデーション', () => {
            let customValidate = (element, form) => {
                if (element.value.indexOf('あいうえお') !== -1) {
                    element.setCustomValidity('カスタムエラー');
                } else {
                    element.setCustomValidity('');
                }
            };
            validate.option.customValidate.text = customValidate;
            spy.customValidate = sinon.spy(validate.option.customValidate, 'text');

            $form.text.value = 'あいうえお';
            validate.trigger('input', $form.text);
            assert(spy.customValidate.callCount === 1);
            assert(validate.isValid() === false);
            assert($submit.getAttribute('disabled') === 'disabled');

            $form.text.value = '';
            validate.trigger('input', $form.text);
            assert(spy.customValidate.callCount === 2);
            assert(validate.isValid() === false);
            assert($submit.getAttribute('disabled') === 'disabled');

            $form.text.value = 'かきくけこ';
            validate.trigger('input', $form.text);
            assert(spy.customValidate.callCount === 3);
            assert(validate.isValid() === true);
            assert($submit.getAttribute('disabled') === null);

            assert(spy.customValidate.calledWith($form.text, $form));  // callbackの引数チェック
        })
    });

    describe('submit', () => {

        beforeEach(() => {
            spy.formSubmit = sinon.spy(validate.form, 'submit');
        });

        it('option.onSubmitHandler未指定 (form.submitを発火させる)', () => {
            validate.submit();
            assert(spy.submit.callCount === 1);
            assert(spy.formSubmit.callCount === 0);

            $form.text.value = 'あいうえお';
            validate.trigger('input', $form.text);
            validate.submit();
            assert(spy.submit.callCount === 2);
            assert(spy.formSubmit.callCount === 1);
        });

        it('option.onSubmitHandler指定 (form.submitは発火させない)', () => {
            let submitHandler = () => {};
            validate.option.onSubmitHandler = submitHandler;
            spy.onSubmitHandler = sinon.spy(validate.option, 'onSubmitHandler');

            validate.submit();
            assert(spy.submit.callCount === 1);
            assert(spy.formSubmit.callCount === 0);

            $form.text.value = 'あいうえお';
            validate.trigger('input', $form.text);
            validate.submit();
            assert(spy.submit.callCount === 2);
            assert(spy.formSubmit.callCount === 0);
            assert(spy.onSubmitHandler.callCount === 1);
        })
    });

    it('destroy', () => {
        validate.destroy();

        validate.trigger('input', $form.text);
        assert(spy.update.callCount === 0);
        validate.trigger('change', $form.text);
        assert(spy.update.callCount === 0);

        $form.text.value = 'あいうえお';
        validate.trigger('input', $form.text);
        validate.trigger('submit', $form);
        assert(spy.submit.callCount === 0);
    });

    it('extend', () => {
        let obj = {
            number: 123,
            obj: {
                string: 'bar'
            }
        };
        let src = {
            number: 456,
            obj: {
                string: 'foobar'
            },
            bool: true
        };
        validate.extend(obj, src);
        assert(obj.number === src.number);
        assert(obj.obj.string === src.obj.string);
        assert(obj.bool === src.bool);

        obj = {};
        src = {
            customValidate: {
                name: () => {}
            },
            onCheckHandler: () => {},
            onSubmitHandler: () => {}
        };
        validate.extend(obj, src);

        assert(obj.onCheckHandler === src.onCheckHandler);
        assert(obj.customValidate.name === src.customValidate.name);

        src.customValidate.name = () => {};
        assert(obj.customValidate.name !== src.customValidate.name);
    });

});