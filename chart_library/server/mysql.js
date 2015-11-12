var mysql = require('mysql');

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'web_chart'
});
connection.connect();

exports.connection = connection;
