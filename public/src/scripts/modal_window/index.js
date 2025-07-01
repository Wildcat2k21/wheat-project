//управление модальным окном на сайте
const modalWindow = {
    $background: null,
    $panel: null,
    $topPanel: null,
    $closeBtn: null,
    $panelContent: null,
    $title: null,
    $content: null,

    modalWindowIsInDocument: false,

    showModalWindow: function (title, content) {
        if(!this.modalWindowIsInDocument) {
            this.appendModalWindow();
        }

        this.$title.textContent = title;
        this.$content.innerHTML = content.toString().replaceAll('\n', '<br/>');

        //ставим обработчик закрытия при клике на задний фон модального окна
        this.$background.addEventListener('click', closeModalWindowHandler);

        //блокируем прокрутку страницы
        document.body.style.overflow = 'hidden';
    },

    removeModalWindow: function () {
        this.$background.removeEventListener('click', closeModalWindowHandler);

        if (this.modalWindowIsInDocument) {
            this.$background.remove();
        }

        Object.keys(this).forEach(key => {
            key.startsWith('$') && (this[key] = null);
        });

        this.modalWindowIsInDocument = false;

        //разблокируем прокрутку страницы
        document.body.style.overflow = '';
    },

    appendModalWindow: function () {
        if (!this.modalWindowIsInDocument) {
            this.createModalWindow();
            this.$closeBtn.focus();
        }
    },

    createModalWindow: function () {
        this.$background = document.createElement('div');
        this.$background.classList.add('modal-background');
    
        this.$panel = document.createElement('div');
        this.$panel.classList.add('modal-panel');

        this.$title = document.createElement('h3');
        this.$title.classList.add('modal-title');

        this.$content = document.createElement('span');
        this.$content.classList.add('modal-content');
    
        this.$topPanel = document.createElement('div');
        this.$topPanel.classList.add('modal-top-panel');

        this.$closeBtn = document.createElement('button');
        this.$closeBtn.classList.add('modal-close-btn');
        this.$closeBtn.tabIndex = 0;
        this.$closeBtn.textContent = '✖';
    
        this.$panelContent = document.createElement('div');
        this.$panelContent.classList.add('modal-panel-content');
        
        this.$topPanel.append(this.$closeBtn);
        this.$panelContent.append(this.$title);
        this.$panelContent.append(this.$content);
        this.$panel.append(this.$topPanel, this.$panelContent);
        this.$background.append(this.$panel);
        document.body.append(this.$background);

        this.modalWindowIsInDocument = true;
    },
}

const closeModalWindowHandler = ({ target }) => {
    const {$background, $closeBtn} = modalWindow;

    const compareClassLists = (classList1, classList2) => {
        const classListArr1 = Array.from(classList1);
        const classListArr2 = Array.from(classList2);

        return classListArr1.every(className => classListArr2.includes(className));
    }

    const targetConteinsBackgroundClasses = () =>
        compareClassLists(target.classList, $background.classList);

    const targetContainsCloseBtnClasses = () =>
        compareClassLists(target.classList, $closeBtn.classList);

    if(targetConteinsBackgroundClasses() || targetContainsCloseBtnClasses()) {
        modalWindow.removeModalWindow();
    }
}