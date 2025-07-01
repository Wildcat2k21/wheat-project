//тут идет общая логика для страницы reports. Проверка заполнения полей, 
//получение списка отчетов, пагинация и т.д

const REPORT_LIST_SELECTOR = '#report-list';
const REPORTS_NAV_FORWARD_BTN_SELECTOR = '#reports-forward-nav-btn';
const REPORTS_NAV_BACKWARD_BTN_SELECTOR = '#reports-backward-nav-btn';
const SUBMIT_BTN_SELECTOR = '#submit-btn';

//создаем элемент списка отчета
const createReportElement = ({title, description, sphere, fullname, id}) => {
    const reportItem = document.createElement('a');
    reportItem.href = `/pages/report.html?id=${id}`;
    reportItem.target = '_blank';
    reportItem.classList.add('report-item');

    const reportImage = document.createElement('div');
    reportImage.classList.add('report-image');

    const reportInfo = document.createElement('div');
    reportInfo.classList.add('report-info');

    const reportTitle = document.createElement('h3');
    reportTitle.classList.add('report-title');
    reportTitle.textContent = title + ' (' + fullname + ')';

    const reportDescription = document.createElement('span');
    reportDescription.classList.add('report-description');
    reportDescription.textContent = description;

    const reportSphere = document.createElement('span');
    reportSphere.classList.add('report-sphere');
    reportSphere.textContent = sphere;

    reportInfo.append(reportTitle, reportDescription, reportSphere);
    reportItem.append(reportImage, reportInfo);

    return reportItem;
}

//тут обрабатываем список отчетов и добавляем его на страницу
const handleAndAppendReportList = (reportList) => {
    const reportElementArr = reportList.map(reportItem => createReportElement(reportItem));
    const $reportList = document.querySelector(REPORT_LIST_SELECTOR);
    $reportList.append(...reportElementArr);
}

//получение отчетов
const getReportsPart = async(page, limit) => {
    const response = await fetch(`/api/reports?_page=${page}&_limit=${limit}`);
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

const getListPartByPagination = async () => {
    const pageQueryParam = new URLSearchParams(window.location.search).get('_page');
    const limitQueryParam = new URLSearchParams(window.location.search).get('_limit');

    const sessionStoragePage = sessionStorage.getItem('_page');
    const sessionStorageLimit = sessionStorage.getItem('_limit');

    //параметры могут быть не заданы, в таком случае будут равны null, как и параметры из sessionStorage
    //потому используем следующий приоритет: queryParams - sessionStorage - по умолчанию
    const fixedPageNumber = parseInt(pageQueryParam ?? sessionStoragePage) || 1;
    const fixedPageLimit = parseInt(limitQueryParam ?? sessionStorageLimit) || 10;

    const $backwardBtn = document.querySelector(REPORTS_NAV_BACKWARD_BTN_SELECTOR);
    const $forwardBtn = document.querySelector(REPORTS_NAV_FORWARD_BTN_SELECTOR);

    let reportsData;

    try{
        //получем список отчетов
        reportsData = await getReportsPart(fixedPageNumber, fixedPageLimit);
    }
    catch(err){
        if(err.redirect){
            return window.location.href = err.redirect;
        }

        const {status = '', title, message} = err;
        modalWindow.showModalWindow(`${status} ${title}`.trim(), message);
        throw err;
    }

    let {reportList, totalPages, limit, page} = reportsData;

    //сохроняем значения пагинации в sessionStorage
    setSessionStorage('_page', page);
    setSessionStorage('_limit', limit);

    //В зависимости от текущей страницы включаем/выключаем кнопки навигации назад
    if(page == 1){
        $backwardBtn.disabled = true;
        $backwardBtn.classList.add('disabled-btn');
    }
    else{
        $backwardBtn.addEventListener('click', handleBackwardBtnClick);
    }

    //В зависимости от текущей страницы включаем/выключаем кнопки навигации вперед
    if(page == totalPages){
        $forwardBtn.disabled = true;
        $forwardBtn.classList.add('disabled-btn');
    }
    else{
        $forwardBtn.addEventListener('click', handleForwardBtnClick);
    }

    //добавляем отчеты на страницу
    handleAndAppendReportList(reportList);
}

//навигация на следующую страницу с отчетами
const handleForwardBtnClick = () => {
    const currentPage = sessionStorage.getItem('_page');
    const currentLimit = sessionStorage.getItem('_limit');

    const nextPage = parseInt(currentPage) + 1;
    window.location.href = `/pages/reports.html?_page=${nextPage}&_limit=${currentLimit}`;
}

//навигация на предыдущую страницу с отчетами
const handleBackwardBtnClick = () => {
    const currentPage = sessionStorage.getItem('_page');
    const currentLimit = sessionStorage.getItem('_limit');

    const backwardPage = parseInt(currentPage) - 1;
    window.location.href = `/pages/reports.html?_page=${backwardPage}&_limit=${currentLimit}`;
}

document.addEventListener('DOMContentLoaded', getListPartByPagination);

//проверк заполнения полей нового отчета
const dataComplete = {

    //поля для заполнения
    allItems: {
        description: false,
        sphere: false,
        title: false,
        file: false
    },

    //все поля будут отмечены в данном методе, в котором также будет происходит проверка 
    //заполнения всех остальных полей, и переключение состояние кнопки отправления формы нового отчета. (активная, неактивная)
    markItem (itemName, isComplete) {
        this.allItems[itemName] = isComplete;
        const $submitBtn = document.querySelector(SUBMIT_BTN_SELECTOR);
        const isDisabled = $submitBtn.disabled;

        //прерываем выполнение, если файл не выбран
        //чтобы кнопка не была стилизована
        if(!this.allItems.file){
            return
        }

        //проверяем заполненность всех полей
        if(Object.keys(this.allItems).every(item => this.allItems[item])){
            //делаем кнопку отправки активной
            $submitBtn.removeAttribute('disabled');
            $submitBtn.classList.remove('disabled-btn');
        }
        //если не все поля заполнены, то делаем кнопку неактивной
        else if(!isDisabled){
            $submitBtn.disabled = true;
            $submitBtn.classList.add('disabled-btn');
        }
    } 
}