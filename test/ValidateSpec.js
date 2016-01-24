import Validate from '../lib/Validate';

describe('Validate', () => {

    let fixtures = __html__["test/fixtures/index.html"];
    let validate;
    let $form;
    let $submit;

    let spy = {};

    let setValue = () => {
        $form.name.value = 'なまえ';
        $form.text.value = 'あいうえお';
        $form.password.value = 'passord';
        $form.passwordConfirm.value = 'passord';
        validate.trigger('input', $form.name);
        validate.trigger('input', $form.text);
        validate.trigger('input', $form.password);
        validate.trigger('input', $form.passwordConfirm);
    };

    beforeEach(() => {
         document.body.innerHTML = fixtures;

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
        let htmlString = '<form id="form"><input type="text" name="name" required=""><input type="text" name="text" minlength="4"><input type="email" name="email"><input type="tel" name="tel"><select name="select"><option value=""></option><option value="1">1</option><option value="2">2</option></select><input type="radio" name="radio"><input type="radio" name="radio"><input type="checkbox" name="checkbox"><input type="password" name="password" required=""><input type="password" name="passwordConfirm" required=""><button type="submit" disabled="disabled">送信</button></form>';
        assert($form.outerHTML.replace(/>\s+/g,'>') === htmlString);
        assert(validate.submitBtn.outerHTML.replace(/\n|\t/g, '') === '<button type="submit" disabled="disabled">送信</button>');

        // Event
        validate.trigger('input', $form.text);
        assert(spy.update.callCount === 1);
        validate.trigger('change', $form.text);
        assert(spy.update.callCount === 2);

        validate.trigger('change', $form.select);
        assert(spy.update.callCount === 3);

        validate.trigger('input', $form.radio[0]);
        assert(spy.update.callCount === 4);

        validate.trigger('input', $form.checkbox);
        assert(spy.update.callCount === 5);

        // ボタンがdisabledだとsubmitイベントは発火しないらしい
        validate.trigger('submit', $form);
        assert(spy.submit.callCount === 0);

        // validな状態でsubmit可能
        setValue();

        validate.trigger('submit', $form);
        assert(spy.submit.callCount === 1);
    });

    it('isValid', () => {
        assert(validate.isValid() === false);

        // validな状態でsubmit可能
        setValue();
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

            // validな状態でsubmit可能
            setValue();
            assert(validate.isValid() === true);
            assert($submit.getAttribute('disabled') === null);

            // 必須項目を空にする
            $form.name.value = '';
            validate.trigger('input', $form.name);
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
            setValue();

            let customValidate = {
                password: (element, form) => {
                    // todo thisがなぜかテスト上ではundefined
                    validate.trigger('input', form['passwordConfirm']);
                    //this.trigger('input', form['passwordConfirm']);
                },
                passwordConfirm: (element, form) => {
                    if (element.value !== form['password'].value) {
                        element.setCustomValidity('パスワードが一致しません');
                        return;
                    }
                    element.setCustomValidity('');
                }
            };
            validate.option.customValidate = customValidate;
            spy.customValidate = {
                password: sinon.spy(validate.option.customValidate, 'password'),
                passwordConfirm: sinon.spy(validate.option.customValidate, 'passwordConfirm')
            };
            spy.passwordConfirm = {
                setCustomValidity: sinon.spy($form.passwordConfirm, 'setCustomValidity')
            };

            // パスワードの値を空にする
            $form.password.value = '';
            validate.trigger('input', $form.password);
            assert(spy.customValidate.password.callCount === 1);
            assert(spy.customValidate.passwordConfirm.callCount === 1);
            assert(spy.passwordConfirm.setCustomValidity.calledWith('パスワードが一致しません'));
            assert(validate.isValid() === false);
            assert($submit.getAttribute('disabled') === 'disabled');

            // パスワード確認の値を空にする
            $form.passwordConfirm.value = '';
            validate.trigger('input', $form.passwordConfirm);
            assert(spy.customValidate.passwordConfirm.callCount === 2);
            assert(spy.passwordConfirm.setCustomValidity.calledWith('パスワードが一致しません'));
            assert(validate.isValid() === false);
            assert($submit.getAttribute('disabled') === 'disabled');

            // パスワードの値を入力
            $form.password.value = 'password';
            validate.trigger('input', $form.password);
            assert(spy.customValidate.password.callCount === 2);
            assert(spy.customValidate.passwordConfirm.callCount === 3);
            assert(spy.passwordConfirm.setCustomValidity.calledWith('パスワードが一致しません'));
            assert(validate.isValid() === false);
            assert($submit.getAttribute('disabled') === 'disabled');

            // パスワード確認にパスワードと一致する値を入力
            $form.passwordConfirm.value = 'password';
            validate.trigger('input', $form.passwordConfirm);
            assert(spy.customValidate.passwordConfirm.callCount === 4);
            assert(spy.passwordConfirm.setCustomValidity.calledWith(''));
            assert(validate.isValid() === true);
            assert($submit.getAttribute('disabled') === null);

            // パスワードの値をパスワード確認と一致しない値に変更
            $form.password.value = 'password123';
            validate.trigger('input', $form.password);
            assert(spy.customValidate.password.callCount === 3);
            assert(spy.customValidate.passwordConfirm.callCount === 5);
            assert(spy.passwordConfirm.setCustomValidity.calledWith('パスワードが一致しません'));
            assert(validate.isValid() === false);
            assert($submit.getAttribute('disabled') === 'disabled');

            // パスワードの値をパスワード確認と一致する値に変更
            $form.password.value = 'password';
            validate.trigger('input', $form.password);
            assert(spy.customValidate.password.callCount === 4);
            assert(spy.customValidate.passwordConfirm.callCount === 6);
            assert(spy.passwordConfirm.setCustomValidity.calledWith(''));
            assert(validate.isValid() === true);
            assert($submit.getAttribute('disabled') === null);

            // callbackの引数チェック
            assert(spy.customValidate.password.calledWith($form.password, $form));
            assert(spy.customValidate.passwordConfirm.calledWith($form.passwordConfirm, $form));
        });
    });

    describe('submit', () => {

        beforeEach(() => {
            spy.formSubmit = sinon.spy(validate.form, 'submit');
        });

        it('option.onSubmitHandler未指定 (form.submitを発火させる)', () => {
            validate.submit();
            assert(spy.submit.callCount === 1);
            assert(spy.formSubmit.callCount === 0);

            setValue();
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

            setValue();
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