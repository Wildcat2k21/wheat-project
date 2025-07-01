//создаем контект на странице
const createReportPageContent = ({ pdf_link, title, description, sphere, publisher }) => {
    const $reportTitle = document.querySelector('#report-title');
    const $reportDescription = document.querySelector('#report-sphere');
    const $reportSphere = document.querySelector('#report-description');
    const $reportPublisher = document.querySelector('#report-publisher');
    const $docIframe = document.querySelector('#doc-iframe');
    const $content = document.querySelector('.content');

    $reportTitle.textContent = title;
    $reportDescription.textContent = description;
    $reportSphere.textContent = sphere;
    $reportPublisher.textContent = publisher;
    $docIframe.src = pdf_link;

    $content.style.opacity = 1;
}

//получаем данные о отчете
const getReportInfo = async() => {
    const reportId = new URLSearchParams(window.location.search).get('id');
    const response = await fetch(`/api/reports/${reportId}`);
    const contentType = response.headers.get("content-type");

    if(!response.ok && contentType?.includes("application/json")){
        const errorDetails = await response.json();

        //проверка на сообщение редиректа от сервера
        if(errorDetails.redirect){
            return errorDetails;
        }

        const newError = Object.assign(new Error(), errorDetails);
        throw newError;
    }

    if(!contentType?.includes("application/json")){
        if(!response.ok){
            const {status, statusText, url} = response;
            const newError = Object.assign(new Error(), {status, title: statusText, message: url});
            throw newError;
        }

        if(response.redirected){
            const newError = Object.assign(new Error(), {title: 'Запрос был неожиданно перенаправлен', message: `Сервер перенаправил запрос на другой URL: ${response.url}\nВозможно искомый ресурс не существует`});
            throw newError;
        }
    }

    //получаем данные отчета      
    return await response.json();
}

//выполняем сценарий при готовности документа
document.addEventListener('DOMContentLoaded', async() => {
    let reportData = null;

    try{
        reportData = await getReportInfo();

        if(reportData.redirect){
            return window.location.href = reportData.redirect;
        }
    }
    catch(err){
        const {status = '', title, message} = err;
        modalWindow.showModalWindow(`${status} ${title}`.trim(), message);
        throw err;
    }
    
    createReportPageContent(reportData);
});