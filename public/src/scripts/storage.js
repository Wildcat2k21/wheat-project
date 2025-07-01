//тут идет управление хранилищем на сайте

//Работа с куками
function setCookie(name, value) {
    document.cookie = name + "=" + value + "; path=/";
}

function getCookie(name) {
    const value = "; " + document.cookie;
    const parts = value.split("; " + name + "=");
    if (parts.length === 2) return parts.pop().split(";").shift();
}

function deleteCookie(name) {
    document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/;";
}    

// Функции для работы с Local Storage и Session Storage
function setLocalStorage(key, value) {
    localStorage.setItem(key, value);
}

function getLocalStorage(key) {
    return localStorage.getItem(key);
}

function deleteLocalStorage(key) {
    localStorage.removeItem(key);
}

function setSessionStorage(key, value) {
    sessionStorage.setItem(key, value);
}

function getSessionStorage(key) {
    return sessionStorage.getItem(key);
}

function deleteSessionStorage(key) {
    sessionStorage.removeItem(key);
}