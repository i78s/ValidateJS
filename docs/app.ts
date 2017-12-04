import Validate, { ValidateMessages } from '../src/index';

let validateMessages = new ValidateMessages('.js-validate-messages');
let validate = new Validate('form', {
    customValidate: {
        password: function(element: HTMLInputElement, form: HTMLFormElement) {
            this.trigger('change', form['passwordConfirm']);
        },
        passwordConfirm: function(element: HTMLInputElement, form: HTMLFormElement) {
            if (element.value !== form['password'].value) {
                element.setCustomValidity('パスワードが一致しません');
                return;
            }
            element.setCustomValidity('');
        }
    },
    onCheckHandler: function(element: HTMLInputElement | HTMLSelectElement, validity: ValidityState) {
        let parent: any = element.parentNode;
        validateMessages.update(element.name, validity);

        validateMessages.toggleClass(parent, 'has-success', validity.valid);
        validateMessages.toggleClass(parent, 'has-error', !validity.valid);
    },
    onSubmitHandler: function() {
        alert('submit');
    }
});