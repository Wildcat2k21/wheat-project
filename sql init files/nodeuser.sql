CREATE USER 'nodejs'@'localhost' IDENTIFIED BY 'Qs1w&SmsWsOesd973123a1DsWefdsW_a2MnsW';

GRANT SELECT, UPDATE, DELETE, INSERT, EXECUTE ON `office example`.* TO 'nodejs'@'localhost';

FLUSH PRIVILEGES;