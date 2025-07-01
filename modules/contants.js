//модуль с константами
import dotenv from 'dotenv';
dotenv.config();

//параметры подключения к базе данных из env окружения
export const databaseConfig = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
};

//алфовит для nanoid c латиницей в верхнем и нижнем регистре и цифрами
export const nanoIdAlphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

//дектории для сохранения файлов
export const profileIconsPath = 'profile_icons';
export const pdfDocsPath = 'pdf_docs';
export const temporaryFilesPath = 'temporary_files';

//страндартные значения пагинации
export const defaultPaginationPage = 1;
export const defaultPaginationLimit = 10;