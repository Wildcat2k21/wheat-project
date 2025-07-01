//тут идет общая логика всего работы всего сайта
//получаем сведения от ошибки при редиректе в query параметрах
const checkQueriesForMessageFromServer = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const message = urlParams.get('message');
    const title = urlParams.get('title');

    //тут декодмруем query параметры из URI
    if(message && title){
        const decodedTitleURI = decodeURIComponent(title);
        const decodedMessageURI = decodeURIComponent(message);
        modalWindow.showModalWindow(decodedTitleURI, decodedMessageURI);
    }
}

document.addEventListener('DOMContentLoaded', checkQueriesForMessageFromServer);