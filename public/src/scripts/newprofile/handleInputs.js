//тут идет обработка ввода полей регистрации на странице newprofile

const $fullname = document.querySelector('#fullname');
const $position = document.querySelector('#position');
const $phone = document.querySelector('#phone');
const $email = document.querySelector('#mail');
const $login = document.querySelector('#login');
const $password = document.querySelector('#passwod');
const $repeatPassword = document.querySelector('#repeat-password');
const $maleGender = document.querySelector('#male-gender');
const $fimaleGender = document.querySelector('#female-gender');

const comparePasswords = () => $password.value === $repeatPassword.value && $password.value.length > 3;

$fullname.addEventListener('input', ({ target }) => {
    dataComplete.markItem('fullname', target.value.length > 0);
});

$position.addEventListener('input', ({ target }) => {
    dataComplete.markItem('position', target.value.length > 0);
});

$phone.addEventListener('input', ({ target }) => {
    dataComplete.markItem('phone', target.value.length > 0);
});

$email.addEventListener('input', ({ target }) => {
    dataComplete.markItem('mail', target.value.length > 0);
});

$login.addEventListener('input', ({ target }) => {
    dataComplete.markItem('login', target.value.length > 0);
});

$maleGender.addEventListener('change', () => {
    dataComplete.markItem('sex', true);
});

$fimaleGender.addEventListener('change', () => {
    dataComplete.markItem('sex', true);
});

//проверяем правильность повтора пароля
const handlePasswordRepeat = () => {
    dataComplete.markItem('password', comparePasswords());
}

$password.addEventListener('input', handlePasswordRepeat);
$repeatPassword.addEventListener('input', handlePasswordRepeat);