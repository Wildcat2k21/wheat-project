// Внешние зависимости
import express from 'express';
import cookieParser from 'cookie-parser';
import multer from 'multer';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { customAlphabet } from 'nanoid';

// Конфигурация и переменные
import {
    databaseConfig,
    profileIconsPath,
    pdfDocsPath,
    nanoIdAlphabet,
    temporaryFilesPath 
} from './modules/contants.js';

// Сущности базы представленные классами
import Report from './modules/database/entities/report.js';
import Profile from './modules/database/entities/profile.js';

// Проверки middleware
import {
    cookiesMiddleware,
    cookiesMiddlewareAPI
} from './modules/middlewares/index.js';

// Помощники и утилиты
import {
    createQueryMessageString,
    reportFieldsFilter,
    paginationFixer
} from './modules/helpers/index.js';

// Проверки вводов
import {
    checkLoginInputs,
    checkNewProfileInputs,
    checkReportInputs 
} from './modules/inputs_checkers/index.js';

//порт приложения
const APP_PORT = process.env.PORT || 3000;

const nanoid = customAlphabet(nanoIdAlphabet, 8);

//используем переменные окружения для разработки
dotenv.config();

//добавляем middlewares
const app = express();
const apiRouter = express.Router();

// Настройка хранения файлов (временных файлов)
const upload = multer({
    dest: temporaryFilesPath,
    limits: { fileSize: 10 * 1024 * 1024 } //ограничение размера файла 10МБ
}); 

//подключаем статические файлы
app.use(express.static('public'));
apiRouter.use('/profile_icons', express.static('profile_icons'));
apiRouter.use('/docs', express.static('pdf_docs'));

//подключаем middlewares
apiRouter.use(cookieParser());
apiRouter.use(express.json({limit: '2mb'}));
apiRouter.use(express.urlencoded({ extended: true }));

//обработка формы авторизации со страницы login.html
apiRouter.post('/login', async (req, res) => {
    const formData = req.body;

    //Проверяем заполнение полей
    if(!checkLoginInputs(formData)){
        const message = createQueryMessageString('Ошибка', 'Не все поля заполнены');
        return res.status(400).redirect(`/pages/login.html?${message}`);
    }

    const profile = new Profile(databaseConfig);

    try{
        const profileData = await profile.select([], formData);

        //Проверяем наличие пользователя с таким логином и верность пароля
        if(!profileData.length || profileData[0].password !== formData.password){
            const message = createQueryMessageString('Ошибка', 'Неверные логин или пароль');
            return res.status(400).redirect(`/pages/login.html?${message}`);
        }

        //куки авторизации
        res.cookie('auth-cookie', `${formData.login};${formData.password}`, {
            httpOnly: true,       // При true браузер не даст доступ к cookie через JS
            secure: false,        // При true только через HTTPS (убрать, если тесты локальные)
            sameSite: 'Lax',      // Позволяет отправлять куки с тем же сайтом
            maxAge: 3600000       // Время жизни 1 час
        });

        //куки uid профиля
        res.cookie('profile-uid', profileData[0].uid, {
            httpOnly: false,      // При true браузер не даст доступ к cookie через JS
            secure: false,        // При true только через HTTPS (убрать, если тесты локальные)
            sameSite: 'Lax',      // Позволяет отправлять куки с тем же сайтом
            maxAge: 3600000       // Время жизни 1 час
        });

        const message = createQueryMessageString('👋 Добро пожаловать в систему', `Рады вас видеть, ${ profileData[0].fullname}.\nСделать публикацию можно в разделе "Публикации"`);
        res.status(200).redirect(`/index.html?${message}`);
    }
    catch(err){
        console.error(err);
        const errorMessage = createQueryMessageString('Ошибка', 'Что-то пошло не так');
        res.status(500).redirect(`/pages/login.html?${errorMessage}`);
    }
    //Закрываем пул с подключением к базе данных
    finally{
        await profile.closePool();
    }
});

//обработка формы нового пользователя со страницы newprofile.html
apiRouter.post('/profile', upload.single('profile-img'), async (req, res) => {
    const formData = req.body;

    //Проверяем заполнение полей
    if(!checkNewProfileInputs(formData)){
        const message = createQueryMessageString('Ошибка', 'Не все поля заполнены');
        return res.status(400).redirect(`/pages/newprofile.html?${message}`);
    }

    //проверяем наличие файла профиля
    if(!req.file){
        const message = createQueryMessageString('Ошибка', 'Изображение профиля не выбрано');
        return res.status(400).redirect(`/pages/newprofile.html?${message}`);
    }

    //класс для работы с сущностью profile базы данных через pool
    const profile = new Profile(databaseConfig);

    try {
        const userWithSameLogin = await profile.select([], { login: formData.login });

        //Проверяем наличие пользователя с таким логином
        if(userWithSameLogin.length){
            const message = createQueryMessageString('Ошибка', 'Пользователь с таким логином уже зарегистрирован');
            return res.status(400).redirect(`/pages/newprofile.html?${message}`);
        }

        //уникальный идентификатор профиля
        let profile_uid, sameProfileUid;

        //генерируем уникальный uid пока не найдем свободный
        do {
            profile_uid = nanoid(8);
            sameProfileUid = await profile.select([], { uid: profile_uid });
        } while (sameProfileUid.length > 0);

        //Подготовка временной директории для загрузки изображения
        const tempPath = req.file.path;
        const filename = `${profile_uid}.png`;
        const outputPath = path.join(profileIconsPath, filename);

        formData.uid = profile_uid;

        //обрабатываем временный файл изображения
        await sharp(tempPath)
            .resize(126, 126)
            .toFile(outputPath);

        // Удаляем временный файл
        await fs.promises.unlink(tempPath);

        //Создаем новую запись в таблице profile
        await profile.create(formData);

        //куки авторизации
        res.cookie('auth-cookie', `${formData.login};${formData.password}`, {
            httpOnly: true,       // При true браузер не даст доступ к cookie через JS
            secure: false,        // При true только через HTTPS (убрать, если тесты локальные)
            sameSite: 'Lax',      // Позволяет отправлять куки с тем же сайтом
            maxAge: 3600000       // Время жизни 1 час
        });

        //куки uid профиля
        res.cookie('profile-uid', profile_uid, {
            httpOnly: false,      // При true браузер не даст доступ к cookie через JS
            secure: false,        // При true только через HTTPS (убрать, если тесты локальные)
            sameSite: 'Lax',      // Позволяет отправлять куки с тем же сайтом
            maxAge: 3600000       // Время жизни 1 час
        });

        //отправляем сообщение успеха
        const message = createQueryMessageString('Новый профиль успешно создан ✔️', `Рады вас видеть, ${formData.fullname}.\nСделать публикацию можно в разделе "Публикации"`);
        res.status(200).redirect(`/index.html?${message}`);
    }
    //Обрабатываем ошибки
    catch (err) {
        console.error(err);
        const errorMessage = createQueryMessageString('Ошибка', 'Что-то пошло не так');
        res.status(500).redirect(`/pages/newprofile.html?${errorMessage}`);
    }
    //Закрываем пул с подключением к базе данных
    finally{
        await profile.closePool();
    }
});

//Обработка формы нового отчета со страницы reports.html
apiRouter.post('/report', cookiesMiddleware, upload.single('pdf-file'), async (req, res) => {
    const formData = req.body;
    const report = new Report(databaseConfig);

    try{
        //проверяем поля формы отчета
        if(!checkReportInputs(formData)){
            const message = createQueryMessageString('Ошибка', 'Не все поля публикации заполнены');
            return res.status(400).redirect(`/pages/reports.html?${message}`);
        }

        //проверяем наличие файла отчета
        if(!req.file){
            const message = createQueryMessageString('Ошибка', 'Файл публикации не выбран');
            return res.status(400).redirect(`/pages/reports.html?${message}`);
        }

        const login = decodeURIComponent(req.cookies['auth-cookie']).split(';')[0];

        const {insertId} = await report.create({...formData, profile_login: login});

        //Подготовка временной директории для загрузки изображения
        const tempPath = req.file.path;
        const filename = `report_${insertId}.pdf`;
        const outputPath = path.join(pdfDocsPath, filename);

        //Сохраняем pdf файл с названием temp в output
        await fs.promises.rename(tempPath, outputPath);

        const message = createQueryMessageString('Успешно 🎉', `Публикация "${formData.title}" успешно выполнена`);
        res.status(200).redirect(`/pages/reports.html?${message}`);
    }
    catch(err){
        console.error(err);
        const errorMessage = createQueryMessageString('Ошибка', 'Что-то пошло не так');
        res.status(500).redirect(`/pages/reports.html?${errorMessage}`);
    }
    finally{
        await report.closePool();
    }
});

//получение пагинированного списка отчетов для страницы reports.html
apiRouter.get('/reports', cookiesMiddlewareAPI,  async (req, res) => {
    const {_page, _limit} = req.query;
    const report = new Report(databaseConfig);

    try{
        const totalItems = await report.count();
        const [page, limit, totalPages] = paginationFixer(totalItems, _page, _limit);
        const offset = (page - 1) * limit;
    
        const profileJoinTable = [{
            name: 'profile',
            pKey: 'login',
            referencedKey: 'profile_login'
        }]
    
        const profileReports = await report.paginationSelect([], {}, profileJoinTable, limit, offset);
        const reportList = profileReports.map(reportItem => reportFieldsFilter(reportItem));
        res.status(200).json({ reportList, totalPages, limit, page });
    }
    catch(err){
        console.error(err);
        return res.status(500).json({title: 'Ошибка', message: 'Что-то пошло не так'});
    }
    finally{
        await report.closePool();
    }
});

//получение информации для просмотра отчета на странице report.html
apiRouter.get('/reports/:id', cookiesMiddlewareAPI, async (req, res) => {
    const report = new Report(databaseConfig);
    const reportId = parseInt(req.params.id, 10);

    try{
        if(isNaN(reportId) || reportId <= 0){
            const errorMessage = createQueryMessageString('🐦‍⬛ Публикация не найдена', 'Возможно она была удалена или не существует');
            return res.status(404).json({redirect: `/pages/notfound.html?${errorMessage}`});
        }

        const profileJoinTable = [{
            name: 'profile',
            pKey: 'login',
            referencedKey: 'profile_login'
        }]

        const reportItem = await report.select([], { id: reportId }, profileJoinTable);

        if(!reportItem.length){
            const errorMessage = createQueryMessageString('🐦‍⬛ Публикация не найдена', 'Возможно она была удалена или не существует');
            return res.status(404).json({redirect: `/pages/notfound.html?${errorMessage}`});
        }

        const reportFields = reportFieldsFilter(reportItem[0]);
        reportFields.pdf_link = `/api/docs/report_${reportId}.pdf`;
        res.status(200).json(reportFields);
    }
    catch(err){
        console.error(err);
        return res.status(500).json({title: 'Ошибка', message: 'Что-то пошло не так'});
    }
    finally{
        await report.closePool();
    }
});

//используем api router
app.use('/api', apiRouter);

// Middleware для обработки ошибок middleware
app.use((err, req, res, next) => {
    // Безопасно получаем `pathname` предыдущей страницы
    let pathname = '/index.html';
    const referer = req.get('Referer');

    //получаем путь предыдущей страницы
    if (referer) {
        try {
            pathname = new URL(referer).pathname;
        }
        catch (error) {
            console.error('Ошибка парсинга Referer:', error);
        }
    }

    //размер файла превышает допустимый размер
    if(err?.code === 'LIMIT_FILE_SIZE'){
        const errorMessage = createQueryMessageString('🐦‍⬛ Невозможно загрузить файл', 'Размер файла превышает допустимый размер');
        return res.status(413).redirect(`${pathname}?${errorMessage}`);
    }

    // В общем эта обработка бесполезная, так как у нас нет fetch post запросов в приложении
    // Однако это может быть полезно в будущем или для демонстрации
    // Размер тела body json превышает допустимый размер установленный в app.use(express.json({limit: '2mb'}));
    if (err?.type === 'entity.too.large') {
        return res.status(413).json({title: '🐦‍⬛ Ошибка обработки запроса', message: 'Запрос слишком большой'});
    }

    // 400: Ошибки валидации или заведомо неправильные запросы
    if (err?.status === 400 || err?.name === 'ValidationError') {
        const errorMessage = createQueryMessageString('🐦‍⬛ Ошибка запроса', 'Проверьте введенные данные');
        return res.status(400).redirect(`${pathname}?${errorMessage}`);
    }
    
    //для всех остальных ошибок
    const errorMessage = createQueryMessageString('🐦‍⬛ Что-то пошло не так', 'Невозможно обработать запрос. Внутренняя ошибка сервера');
    return res.status(500).redirect(`${pathname}?${errorMessage}`);
});

// Middleware 404 для несуществующих маршрутов
app.use((req, res) => {
    res.status(404).redirect('/pages/notfound.html');
});

//запуск сервера
app.listen(APP_PORT, () => {
    console.log('Server started on port http://localhost:3000');
});