//тут идет обработка pdf файла на странице newprofile
const $fileButton = document.querySelector('#pdf-file');
const $submitBtn = document.querySelector('#submit-btn');  
const $selectPdfContainer = document.querySelector('.select-pdf-container');

const changeFileButtonView = () => {
    //скрываем интерактивную область выбора файла
    $fileButton.style.zIndex = -1;

    //переделываем кнопку под отправку формы
    $submitBtn.type = 'submit';
    $submitBtn.disabled = true;
    $submitBtn.classList.add('disabled-btn');
    $submitBtn.value = 'Файл выбран. Нажмите, чтобы отправить';
}

$fileButton.addEventListener('change', () => {
    changeFileButtonView();
    dataComplete.markItem('file', true);
});