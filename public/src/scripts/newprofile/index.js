//тут идет общая логика для страницы newprofile - Проверка заполнения полей.

const SUBMIT_BTN_SELECTOR = '#login-btn';

//проверк заполнения полей аккаунта
const dataComplete = {

    //поля для заполнения
    allItems: {
        profileImg: false,
        fullname: false,
        position: false,
        phone: false,
        mail: false,
        login: false,
        password: false,
        sex: false
    },

    //все поля будут отмечены в данном методе, в котором также будет происходит проверка 
    //заполнения всех остальных полей, и переключение состояние кнопки отправления формы нового аккаунта. (активная, неактивная)
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
        else{
            //если не все поля заполнены, то делаем кнопку неактивной
            if(!isDisabled){
                $submitBtn.disabled = true;
                $submitBtn.classList.add('disabled-btn');
            }
        }
    } 
}