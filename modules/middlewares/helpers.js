//модуль вспомогательных функций для middleware проверок

import {databaseConfig} from '../contants.js';
import Profile from '../database/entities/profile.js';

//проверка куков авторизации
export const checkAuthCookies = async (req) => {
    if (!req.cookies['auth-cookie']) {
        return false;
    }

    const [login, password] = decodeURIComponent(req.cookies['auth-cookie']).split(';');

    if(!login || !password){
        return false;
    }
    
    const profile = new Profile(databaseConfig);
    const userWithSameCredentials = await profile.select([], { login, password });
    await profile.closePool();

    if(!userWithSameCredentials.length){
        return false
    }

    return true;
};