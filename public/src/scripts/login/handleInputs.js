//тут идет обработка ввода логина и пароля для входа на странице login
const $login = document.querySelector('#login');
const $password = document.querySelector('#password');

$login.addEventListener('input', ({ target }) => {
    dataComplete.markItem('login', target.value.length > 0);
});

$password.addEventListener('input', ({ target }) => {
    dataComplete.markItem('password', target.value.length > 0);
});