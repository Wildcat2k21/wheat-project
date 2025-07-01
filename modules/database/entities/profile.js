//представление сущности profile базы данных классом через наследование от класса Database

import Database from '../index.js';

export default class Profile extends Database {
    constructor(config) {
        super(config);
        this.tableName = 'profile'; // Определяем название таблицы
    }

    //создание нового пользователя
    create(dataObject = {}) {
        return super.insert(this.tableName, dataObject);
    }

    //удаление пользователя
    remove(conditionObject = {}) {
        return super.delete(this.tableName, conditionObject);
    }

    //получение списка пользователей
    select(columns = [], conditionObject = {}, joinTables = []) {
        return super.select(this.tableName, columns, conditionObject, joinTables);
    }
}