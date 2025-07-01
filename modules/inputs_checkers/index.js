//модуль для проверки заполненения полей

//проверка полей формы регистрации
export const checkNewProfileInputs = (data) => {
    const requiredInputs = [
        'fullname',
        'position',
        'phone',
        'mail',
        'login',
        'password',
        'gender'
    ];

    const allDataIsComplete = requiredInputs.every(item => data[item]);
    return allDataIsComplete;
}

//проверка полей формы входа
export const checkLoginInputs = (data) => {
    const requiredInputs = [
        'login',
        'password'
    ];

    const allDataIsComplete = requiredInputs.every(item => data[item]);
    return allDataIsComplete;
}

//проверка полей формы нового отчета
export const checkReportInputs = (data) => {
    const requiredInputs = [
        'title',
        'sphere',
        'description'
    ];

    const allDataIsComplete = requiredInputs.every(item => data[item]);
    return allDataIsComplete;
}