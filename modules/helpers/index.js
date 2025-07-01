//модуль вспомогательных функций приложения

import {defaultPaginationPage, defaultPaginationLimit} from "../contants.js";

//функция создания строки-сообщения из query параметров
export const createQueryMessageString = (title, message) => {
    return new URLSearchParams({
        title,
        message
    }).toString();
}

//убираем лишние поля из отчета перед отправкой
export const reportFieldsFilter = (data) => {
    const fieldsForSending = [
        'id',
        'title',
        'sphere',
        'description',
        'fullname'
    ]

    return fieldsForSending.reduce((acc, field) => ({...acc, [field]: data[field]}), {});
}

//управление пагинацией для списка отчетов
export const paginationFixer = (totalItems, currentPage, itemsPerPage) => {

    const chooseClosestValueIfIsOutOfRange = (value, min, max) => 
        value > max ? max : value < min ? min : value;

    const fixedTotalItems =  totalItems === 0 ? 1 : totalItems;
    const fixedLimitPerPage = isNaN(itemsPerPage) ? defaultPaginationLimit : chooseClosestValueIfIsOutOfRange(itemsPerPage, 1, fixedTotalItems);

    const totalPages = Math.ceil(fixedTotalItems / fixedLimitPerPage);
    const fixedCurrentPage = isNaN(currentPage) ? defaultPaginationPage : chooseClosestValueIfIsOutOfRange(currentPage, 0, totalPages);
    return [fixedCurrentPage, fixedLimitPerPage, totalPages];
}