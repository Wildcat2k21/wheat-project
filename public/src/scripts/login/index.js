//тут идет общая логика для страницы login - Проверка заполнения полей.
const SUBMIT_BTN_SELECTOR = '#submit-btn';

//проверк заполнения полей нового отчета
const dataComplete = {

    //поля для заполнения
    allItems: {
        login: false,
        password: false
    },

    //все поля будут отмечены в данном методе, в котором также будет происходит проверка 
    //заполнения всех остальных полей, и переключение состояние кнопки отправления формы нового отчета. (активная, неактивная)
    markItem (itemName, isComplete) {
        this.allItems[itemName] = isComplete;
        const $submitBtn = document.querySelector(SUBMIT_BTN_SELECTOR);
        const isDisabled = $submitBtn.disabled;

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