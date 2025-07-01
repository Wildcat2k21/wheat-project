//модуль middleware проверок

import {createQueryMessageString} from '../helpers/index.js';
import {checkAuthCookies} from './helpers.js';

//проверка куков авторизации с редиректом
export const cookiesMiddleware = async (req, res, next) => {
    try{
        const isAuth = await checkAuthCookies(req);

        if(!isAuth){
            const errorMessage = createQueryMessageString('Ошибка', 'Вы не авторизованы');
            return res.redirect(`/pages/login.html?${errorMessage}`);
        }

        return next();
    }
    catch(err){
        console.error(err);
        const errorMessage = createQueryMessageString('Ошибка', 'Что-то пошло не так');
        return res.redirect(`/pages/login.html?${errorMessage}`);
    }
};

//проверка куков авторизации без редиректа для fetch запросов
export const cookiesMiddlewareAPI = async (req, res, next) => {
    try{
        const isAuth = await checkAuthCookies(req);

        if(!isAuth){
            const errorMessage = createQueryMessageString('Ошибка', 'Вы не авторизованы');
            return res.status(403).json({redirect: `/pages/login.html?${errorMessage}`});
        }

        return next();
    }
    catch(err){
        console.error(err);
        return res.status(500).json({title: 'Ошибка', message: 'Что-то пошло не так'});
    }
};