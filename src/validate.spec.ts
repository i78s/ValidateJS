import Validate from './index';

describe('Validate', () => {
  let fixtures = `
    <form id="form">
    <input type="text" name="name" required>

    <input type="text" name="text" minlength="4">

    <input type="email" name="email">
    <input type="tel" name="tel">

    <select name="select">
        <option value=""></option>
        <option value="1">1</option>
        <option value="2">2</option>
    </select>

    <input type="radio" name="radio">
    <input type="radio" name="radio">

    <input type="checkbox" name="checkbox">

    <input type="password" name="password" required>
    <input type="password" name="passwordConfirm" required>

    <button type="submit" disabled="disabled">送信</button>
    </form>`;
  let validate: Validate;
  let $form: HTMLFormElement;
  let $name: HTMLInputElement;
  let $text: HTMLInputElement;
  let $select: HTMLSelectElement;
  let $radio: HTMLInputElement;
  let $checkbox: HTMLInputElement;
  let $password: HTMLInputElement;
  let $passwordConfirm: HTMLInputElement;
  let $submit: HTMLButtonElement;

  let updateSpy: jest.SpyInstance;
  let submitSpy: jest.SpyInstance;;

  const setValue = () => {
    $name.value = 'なまえ';
    $text.value = 'あいうえお';
    $password.value = 'passord';
    $passwordConfirm.value = 'passord';
    validate.trigger('input', $name);
    validate.trigger('input', $text);
    validate.trigger('input', $password);
    validate.trigger('input', $passwordConfirm);
  };

  beforeEach(() => {
    document.body.innerHTML = fixtures;
    $form = document.getElementById('form') as HTMLFormElement;
    $name = $form.elements['name'];
    $text = $form.elements['text'];
    $select = $form.elements['select'];
    $radio = $form.elements['radio'];
    $checkbox = $form.elements['checkbox'];
    $password = $form.elements['password'];
    $passwordConfirm = $form.elements['passwordConfirm'];
    $submit = $form.querySelector('button');

    validate = new Validate($form);

    updateSpy = jest.spyOn(validate, 'update');
    submitSpy = jest.spyOn(validate, 'submit');
    $form.submit = jest.fn();
  });

  afterEach(() => {
    updateSpy.mockRestore();
    submitSpy.mockRestore();
    validate.destroy();
  });

  it('init', () => {
    let htmlString =
      '<form id="form"><input type="text" name="name" required=""><input type="text" name="text" minlength="4"><input type="email" name="email"><input type="tel" name="tel"><select name="select"><option value=""></option><option value="1">1</option><option value="2">2</option></select><input type="radio" name="radio"><input type="radio" name="radio"><input type="checkbox" name="checkbox"><input type="password" name="password" required=""><input type="password" name="passwordConfirm" required=""><button type="submit" disabled="disabled">送信</button></form>';
    expect($form.outerHTML.replace(/>\s+/g, '>')).toBe(htmlString);
    expect($submit.disabled).toBe(true);

    // Event
    validate.trigger('input', $text);
    expect(updateSpy).toHaveBeenCalledTimes(1);

    validate.trigger('change', $text);
    expect(updateSpy).toHaveBeenCalledTimes(2);

    validate.trigger('change', $select);
    expect(updateSpy).toHaveBeenCalledTimes(3);

    validate.trigger('input', $radio);
    expect(updateSpy).toHaveBeenCalledTimes(4);

    validate.trigger('input', $checkbox);
    expect(updateSpy).toHaveBeenCalledTimes(5);

    // ボタンがdisabledだとsubmitイベントは発火しないらしい
    validate.trigger('submit', $form);
    expect(submitSpy).toHaveBeenCalledTimes(0);

    // validな状態でsubmit可能
    setValue();
    validate.trigger('submit', $form);
    expect(submitSpy).toHaveBeenCalledTimes(1);
  });

  it('isValid', () => {
    expect(validate.isValid()).toBe(false);

    // validな状態でsubmit可能
    setValue();
    expect(validate.isValid()).toBe(true);
  });

  it('disabled', () => {
    validate.disabled(false);
    expect($submit.disabled).toBe(false);

    validate.disabled(true);
    expect($submit.disabled).toBe(true);
  });

  it('trigger', () => {
    validate.trigger('change', $text);
    expect(updateSpy).toHaveBeenCalledTimes(1);

    validate.trigger('change', $text);
    expect(updateSpy).toHaveBeenCalledTimes(2);
  });

  describe('update', () => {
    it('一度でも変更されたらis-dirtyクラスをつける', () => {
      expect($text.classList.contains('is-dirty')).toBe(false);

      $text.value = 'あいうえお';
      validate.trigger('input', $text);
      expect($text.classList.contains('is-dirty')).toBe(true);

      $text.value = '';
      validate.trigger('input', $text);
      expect($text.classList.contains('is-dirty')).toBe(true);
    });

    it('disabled切り替え', () => {
      expect(validate.isValid()).toBe(false);
      expect($submit.disabled).toBe(true);

      // validな状態でsubmit可能
      setValue();
      expect(validate.isValid()).toBe(true);
      expect($submit.disabled).toBe(false);

      // 必須項目を空にする
      $name.value = '';
      validate.trigger('input', $name);
      expect(validate.isValid()).toBe(false);
      expect($submit.disabled).toBe(true);
    });

    it('onCheckHandler', () => {
      const onCheckHandler = () => {};
      validate.option.onCheckHandler = onCheckHandler;
      const spyOnCheckHandler = jest.spyOn(validate.option, 'onCheckHandler');

      $text.value = 'あいうえお';
      validate.trigger('input', $text);
      expect(spyOnCheckHandler).toHaveBeenCalledTimes(1);

      $text.value = '';
      validate.trigger('input', $text);
      expect(spyOnCheckHandler).toHaveBeenCalledTimes(2);
      // callbackの引数チェック
      expect(spyOnCheckHandler).toBeCalledWith($text, $text.validity);
    });

    it('カスタムバリデーション', () => {
      setValue();

      let customValidate = {
        password: function(element, form) {
          this.trigger('input', $passwordConfirm);
        },
        passwordConfirm: function(element, form) {
          if (element.value !== $password.value) {
            element.setCustomValidity('パスワードが一致しません');
            return;
          }
          element.setCustomValidity('');
        }
      };
      validate.option.customValidate = customValidate;

      const spyCustomValidate = {
        password: jest.spyOn(validate.option.customValidate, 'password'),
        passwordConfirm: jest.spyOn(
          validate.option.customValidate,
          'passwordConfirm'
        )
      };
      const spyPasswordConfirm = {
        setCustomValidity: jest.spyOn($passwordConfirm, 'setCustomValidity')
      };

      // パスワードの値を空にする
      $password.value = '';
      validate.trigger('input', $password);
      expect(spyCustomValidate.password).toHaveBeenCalledTimes(1);
      expect(spyCustomValidate.passwordConfirm).toHaveBeenCalledTimes(1);
      expect(spyPasswordConfirm.setCustomValidity).toBeCalledWith(
        'パスワードが一致しません'
      );

      expect(validate.isValid()).toBe(false);
      expect($submit.disabled).toBe(true);

      // パスワード確認の値を空にする
      $passwordConfirm.value = '';
      validate.trigger('input', $passwordConfirm);
      expect(spyCustomValidate.passwordConfirm).toHaveBeenCalledTimes(2);
      expect(spyPasswordConfirm.setCustomValidity).toBeCalledWith(
        'パスワードが一致しません'
      );
      expect(validate.isValid()).toBe(false);
      expect($submit.disabled).toBe(true);

      // パスワードの値を入力
      $password.value = 'password';
      validate.trigger('input', $password);
      expect(spyCustomValidate.password).toHaveBeenCalledTimes(2);
      expect(spyCustomValidate.passwordConfirm).toHaveBeenCalledTimes(3);
      expect(spyPasswordConfirm.setCustomValidity).toBeCalledWith(
        'パスワードが一致しません'
      );
      expect(validate.isValid()).toBe(false);
      expect($submit.disabled).toBe(true);

      // パスワード確認にパスワードと一致する値を入力
      $passwordConfirm.value = 'password';
      validate.trigger('input', $passwordConfirm);
      expect(spyCustomValidate.passwordConfirm).toHaveBeenCalledTimes(4);
      expect(spyPasswordConfirm.setCustomValidity).toBeCalledWith('');
      expect(validate.isValid()).toBe(true);
      expect($submit.disabled).toBe(false);

      // パスワードの値をパスワード確認と一致しない値に変更
      $password.value = 'password123';
      validate.trigger('input', $password);
      expect(spyCustomValidate.password).toHaveBeenCalledTimes(3);
      expect(spyCustomValidate.passwordConfirm).toHaveBeenCalledTimes(5);
      expect(spyPasswordConfirm.setCustomValidity).toBeCalledWith(
        'パスワードが一致しません'
      );
      expect(validate.isValid()).toBe(false);
      expect($submit.disabled).toBe(true);

      // パスワードの値をパスワード確認と一致する値に変更
      $password.value = 'password';
      validate.trigger('input', $password);
      expect(spyCustomValidate.password).toHaveBeenCalledTimes(4);
      expect(spyCustomValidate.passwordConfirm).toHaveBeenCalledTimes(6);
      expect(spyPasswordConfirm.setCustomValidity).toBeCalledWith('');
      expect(validate.isValid()).toBe(true);
      expect($submit.disabled).toBe(false);

      // callbackの引数チェック
      expect(spyCustomValidate.password).toBeCalledWith($password, $form);
      expect(spyCustomValidate.passwordConfirm).toBeCalledWith(
        $passwordConfirm,
        $form
      );
    });
  });

  describe('submit', () => {
    let onSubmitHandlerSpy: jest.SpyInstance;

    beforeEach(() => {
      let submitHandler = function() {};
      validate.option.onSubmitHandler = submitHandler;
      onSubmitHandlerSpy = jest.spyOn(validate.option, 'onSubmitHandler');
    });

    afterEach(() => {
      onSubmitHandlerSpy.mockRestore();
    });

    it('option.onSubmitHandler未指定 (form.submitを発火させる)', () => {
      validate.submit();
      expect(submitSpy).toHaveBeenCalledTimes(1);

      setValue();
      validate.submit();
      expect(submitSpy).toHaveBeenCalledTimes(2);
    });

    it('option.onSubmitHandler指定 (form.submitは発火させない)', () => {
      validate.submit();
      expect(submitSpy).toHaveBeenCalledTimes(1);
      expect(onSubmitHandlerSpy).toHaveBeenCalledTimes(0);

      setValue();
      validate.submit();
      expect(submitSpy).toHaveBeenCalledTimes(2);
      expect(onSubmitHandlerSpy).toHaveBeenCalledTimes(1);
    });
  });

  it('destroy', () => {
    validate.destroy();

    validate.trigger('input', $text);
    expect(updateSpy).toHaveBeenCalledTimes(0);

    validate.trigger('change', $text);
    expect(updateSpy).toHaveBeenCalledTimes(0);

    $text.value = 'あいうえお';
    validate.trigger('input', $text);
    validate.trigger('submit', $form);
    expect(submitSpy).toHaveBeenCalledTimes(0);
  });
});
