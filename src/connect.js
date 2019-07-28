const mysql = require('mysql');

const db = mysql.createConnection({
    protocol: 'http',
    host: 'localhost',
    port: '3306', 
    user: 'root',
    password: 'root',
    database: 'wordpress'
});

db.connect((err, args) => {
    if (!err) {
        console.log('SQL Conectado com sucesso!');
        console.log(args);
    } else {
        console.log('Erro ao conectar SQL: ', JSON.stringify(err));
    }
});

module.exports = db;