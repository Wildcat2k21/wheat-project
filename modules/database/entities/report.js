//представление сущности report базы данных классом через наследование от класса Database

import Database from '../index.js';
import {createConditionClauseFromObject} from "../helpers.js";

export default class Report extends Database {
    constructor(config) {
        super(config);
        this.tableName = 'report'; // Определяем название таблицы
    }

    //создание нового отчета
    create(dataObject = {}) {
        return super.insert(this.tableName, dataObject);
    }

    //удаление отчета
    remove(conditionObject = {}) {
        return super.delete(this.tableName, conditionObject);
    }

    //получение списка отчетов
    select(columns = [], conditionObject = {}, joinTables = []) {
        return super.select(this.tableName, columns, conditionObject, joinTables);
    }

    //подсчет количества записей
    async count(conditionObject = {}) {
        const [conditionClause, values] = createConditionClauseFromObject(conditionObject);
        const sqlQuery = `SELECT COUNT(*) FROM ${this.tableName} ${conditionClause}`;
        const result = await this.query(sqlQuery, values);
        return result[0]['COUNT(*)'];
    }

    //получение пагинированного списка отчетов
    paginationSelect(columns = [], conditionObject = {}, joinTables = [], limit = 10, offset = 0) {
        return super.paginationSelect(this.tableName, columns, conditionObject, joinTables, 'id', offset, limit);
    }
}