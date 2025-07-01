//Главный модуль для работы с баззой данных
import mysql2 from "mysql2/promise";
import {createInsertClauseFromObject, createConditionClauseFromObject} from "./helpers.js";

export default class Database {
    constructor(config) {
        this.pool = mysql2.createPool({
            ...config,
            waitForConnections: true,
            connectionLimit: 10, // Макс. число одновременных соединений
            queueLimit: 0, // Без ограничения очереди
        });
    }

    //операция вставки данных
    insert(tableName, dataObject) {
        const [insertClause, values] = createInsertClauseFromObject(dataObject);
        const sqlQuery = `INSERT INTO ${tableName} ${insertClause}`;
        return this.query(sqlQuery, values);
    }

    //операция удаления данных
    delete(tableName, conditionObject) {
        const [conditionClause, values] = createConditionClauseFromObject(conditionObject);
        const sqlQuery = `DELETE FROM ${tableName} ${conditionClause}`;
        return this.query(sqlQuery, values);
    }

    //операция выборки данных
    select(tableName, columns, conditionObject, joinTables) {
        const [conditionClause, values] = createConditionClauseFromObject(conditionObject);
        const columnsClause = columns.join(', ') || '*';
      
        const joinTablesClause = joinTables.map(table => {
            return `JOIN ${table.name} ON ${table.name}.${table.pKey} = ${tableName}.${table.referencedKey}`;
        }).join(' ');
      
        const sqlQuery = `SELECT ${columnsClause} FROM ${tableName} ${joinTablesClause} ${conditionClause}`;
        return this.query(sqlQuery, values);
    }

    //пагинированная выборка данных
    paginationSelect(tableName, columns, conditionObject, joinTables, orderBy, offset, limit) {
        const [conditionClause, values] = createConditionClauseFromObject(conditionObject);
        const columnsClause = columns.join(', ') || '*';

        const joinTablesClause = joinTables.map(table => {
            return `JOIN ${table.name} ON ${table.name}.${table.pKey} = ${tableName}.${table.referencedKey}`;
        }).join(' ');

        const sqlQuery = `SELECT ${columnsClause} FROM ${tableName} ${joinTablesClause} ${conditionClause} ORDER BY ${orderBy} LIMIT ${limit} OFFSET ${offset}`;
        return this.query(sqlQuery, [values]);
    }

    //выполнение SQL-запроса
    async query(sql, values = []) {
        const connection = await this.pool.getConnection();
        try {
            const [rows] = await connection.execute(sql, values);
            return rows;
        }
        finally {
            connection.release(); // Возвращаем соединение в пул
        }
    }

    //закрытие пула соединения с базой данных
    async closePool() {
        await this.pool.end(); // Закрытие пула
    }
}