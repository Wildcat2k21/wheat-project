//тут идет управление состоянием навигации на вехрней панели. Показ входа и выхода из личного кабенета
//Проверка наличия куков авторизации

const NAV_CONTAINER_SELECTOR = '.nav-container';

const createLoginTopView = (profileUid) => {

    const userLocationIsPublic = () => 
        document.location.pathname !== '/pages/reports.html';

    //скрываем вкладку отчетов, если пользователь не авторизован
    if(!profileUid){
        const $reportTab = document.querySelector('.report-tab');
        $reportTab.classList.add('disabled-tab');
        $reportTab.href = '#';

        //если пользователь не авторизован, то перенаправляем его на главную
        if(!userLocationIsPublic()){
            return location.href = '/';
        }
    }

    //создаем авторизационную навигацию
    const container = document.createElement('div');
    const link = document.createElement('a');
    container.classList.add('auth-nav', 'nav');
    
    if(profileUid){
        link.textContent = 'Выйти из кабинета';
        link.classList.add('profile-nav-action');
        link.href += '#';

        link.addEventListener('click', logoutProfile);

        //иконка пользователя   
        const iconImage = document.createElement('img');
        iconImage.src = '/api/profile_icons/' + profileUid + '.png';
        iconImage.alt = 'иконка пользователя';

        link.prepend(iconImage);
    }
    else {
        const userLocationIsLogin = () => 
            document.location.pathname === '/pages/login.html' || document.location.pathname === '/pages/newprofile.html';

        if(userLocationIsLogin()){
            link.classList.add('active-tab');
        }
        else{
            link.href = '/pages/login.html';
        }
        
        link.textContent = 'Войти или зарегистрироваться';
    }

    container.appendChild(link);
    document.querySelector(NAV_CONTAINER_SELECTOR).appendChild(container);
}

const logoutProfile = () => {
    deleteCookie('profile-uid');
    location.href = '/';
}

const checkAuthCoookieAndProparePage = () => {
    const profileCookie = getCookie('profile-uid');

    //опция входа и выхода из личного кабенета на панели навигации
    createLoginTopView(profileCookie);
}

document.addEventListener('DOMContentLoaded', checkAuthCoookieAndProparePage);