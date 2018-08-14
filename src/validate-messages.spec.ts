import { ValidateMessages } from './index';

describe('ValidateMessages', () => {
  let validateMessages: ValidateMessages;
  let ValidityState = {
    rangeOverflow: false,
    rangeUnderflow: false,
    stepMismatch: false,
    tooShort: false,
    typeMismatch: false,
    valueMissing: false,
    customError: false,
    patternMismatch: false,
    tooLong: false,
    valid: true,
    badInput: false
  };

  let name: any;
  let email: any;
  let password: any;

  beforeEach(() => {
    document.body.innerHTML = `
        <div class="js-messages" data-messages="name">
            <div data-message="valueMissing">必須項目です</div>
            <div data-message="tooShort">n文字以上で入力してください</div>
        </div>
        <div class="js-messages" data-messages="email">
            <div data-message="valueMissing">必須項目です</div>
            <div data-message="typeMismatch">メールアドレスを入力してください</div>
        </div>
        <div class="js-messages" data-messages="password">
            <div data-message="valueMissing">必須項目です</div>
            <div data-message="tooShort">パスワードはn文字以上で入力してください</div>
            <div data-message="patternMismatch">パスワードはn文字未満で入力してください</div>
            <div data-message="customError">半角英小文字/大文字 数字をそれぞれ1種類以上使用してください</div>
        </div>
        `;
    validateMessages = new ValidateMessages('.js-messages');

    let $name = document.querySelector('[data-messages="name"]') as HTMLElement;
    let $email = document.querySelector(
      '[data-messages="email"]'
    ) as HTMLElement;
    let $password = document.querySelector(
      '[data-messages="password"]'
    ) as HTMLElement;

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
      patternMismatch: $password.querySelector(
        '[data-message="patternMismatch"]'
      ),
      customError: $password.querySelector('[data-message="customError"]')
    };
  });

  describe('update', () => {
    it('classNameの付け替え', () => {
      let state = {
        ...ValidityState,
        valid: false,
        valueMissing: true
      };

      expect(name.valueMissing.classList.contains('is-show')).toBe(false);
      expect(name.tooShort.classList.contains('is-show')).toBe(false);
      expect(email.valueMissing.classList.contains('is-show')).toBe(false);
      expect(email.typeMismatch.classList.contains('is-show')).toBe(false);

      validateMessages.update('name', state);
      expect(name.valueMissing.classList.contains('is-show')).toBe(true);
      expect(name.tooShort.classList.contains('is-show')).toBe(false);
      expect(email.valueMissing.classList.contains('is-show')).toBe(false);
      expect(email.typeMismatch.classList.contains('is-show')).toBe(false);

      validateMessages.update('email', state);
      expect(name.valueMissing.classList.contains('is-show')).toBe(true);
      expect(name.tooShort.classList.contains('is-show')).toBe(false);
      expect(email.valueMissing.classList.contains('is-show')).toBe(true);
      expect(email.typeMismatch.classList.contains('is-show')).toBe(false);

      state = {
        ...ValidityState,
        valid: false,
        valueMissing: false,
        typeMismatch: true
      };
      validateMessages.update('email', state);
      expect(name.valueMissing.classList.contains('is-show')).toBe(true);
      expect(name.tooShort.classList.contains('is-show')).toBe(false);
      expect(email.valueMissing.classList.contains('is-show')).toBe(false);
      expect(email.typeMismatch.classList.contains('is-show')).toBe(true);

      state = {
        ...ValidityState,
        valid: true,
        valueMissing: false
      };
      validateMessages.update('name', state);
      expect(name.valueMissing.classList.contains('is-show')).toBe(false);
      expect(name.tooShort.classList.contains('is-show')).toBe(false);
      expect(email.valueMissing.classList.contains('is-show')).toBe(false);
      expect(email.typeMismatch.classList.contains('is-show')).toBe(true);
    });

    it('表示するメッセージは1つのみ', () => {
      let state = {
        ...ValidityState,
        valid: false,
        // tooShort: true,
        // patternMismatch: true,
        customError: true
      };
      validateMessages.update('password', state);
      expect(password.customError.classList.contains('is-show')).toBe(true);

      let count = 0;
      for (let key in password) {
        if (password[key].classList.contains('is-show')) {

          count++;
        }
      }
      expect(count).toBe(1);
    });
  });

  it('toggleClass', () => {
    let element = name.valueMissing;

    expect(element.classList.contains('is-show')).toBe(false);
    validateMessages.toggleClass(element, 'is-show');
    expect(element.classList.contains('is-show')).toBe(true);
    validateMessages.toggleClass(element, 'is-show');
    expect(element.classList.contains('is-show')).toBe(false);

    validateMessages.toggleClass(element, 'is-show', true);
    expect(element.classList.contains('is-show')).toBe(true);
  });
});
