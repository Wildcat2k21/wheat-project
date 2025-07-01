//Модуль вспомогательных функций для работы с базой данных

//создание блока вставки из объекта для sql запроса
export const createInsertClauseFromObject = (object) => {
    const columnsArr = Object.keys(object);
    const valuesArr = Object.values(object);
    const columns = columnsArr.join(', ');
    const valuesPlaceholders = valuesArr.map((value) => '?').join(', ');
    const sqlQueryClause = `(${columns}) VALUES (${valuesPlaceholders})`;
    return [sqlQueryClause, valuesArr];
}

//создание блока условия из объекта для sql запроса
export const createConditionClauseFromObject = (object) => {
    if(!Object.keys(object).length) return ['', []];

    const columnsValuesArr = Object.keys(object).map(column => `${column} = ?`);
    const valuesArr = Object.values(object);
    const columnsCondition = columnsValuesArr.join(' AND ');
    const sqlQueryClause = `WHERE ${columnsCondition}`;
    return [sqlQueryClause, valuesArr];
}