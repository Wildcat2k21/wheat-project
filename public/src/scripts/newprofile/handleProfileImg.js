//тут идет обработка изображения аккаунта на странице newprofile

const IMG_BTN_SELECTOR = '#select-img-btn';
const IMG_BTN_DECORATED_SELECTOR = '#select-img-decorated-btn';
const IMG_PREVIEW_SELECTOR = '#profile-img-preview';

const $imgBtn = document.querySelector(IMG_BTN_SELECTOR);
const $imgBtnDecorated = document.querySelector(IMG_BTN_DECORATED_SELECTOR);
const $imgPreview = document.querySelector(IMG_PREVIEW_SELECTOR);

const handleImgFile = (event) => {
    $imgBtnDecorated.value = 'Выбрать другой';

    const file = event.target.files[0];
    $imgPreview.src = URL.createObjectURL(file);
    dataComplete.markItem('profileImg', true);
}

$imgBtn.addEventListener('change', handleImgFile);