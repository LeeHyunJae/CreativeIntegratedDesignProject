var moment = require('moment');
var mysql = require('./mysql');
var connection = mysql.connection;
var mail = require('./mail');
var sms = require('./sms');

var data = {
	"line": [],
	"bar": [],
	"pie": []
}

var isDangerous = {
	"line": function() {
		var avg = data.line.reduce(function(a, b) {
			return a + b;
		}) / data.line.length;

		if (avg > 100 || avg < 50) return true;
		else return false;
	}
}

function checkData(type) {
	var query = 'select value from data where type = ? and time >= ?';
	var dateFormat = 'YYYY-MM-DD HH:mm:ss';
	var time = moment().subtract(1, 'hours').format(dateFormat);

	connection.query(query, [type, time], function(err, rows) {
		data[type] = [];
		for (i in rows) {
			data[type].push(rows[i].value);
		}
		if (isDangerous[type]()) {
			warn(type);
		}	
	});
}

function warn(type) {
	sms.send('010-5564-3754', 'You are dangerous.', function() {
		console.log("The message has been sent.");
	});
	mail.send('ysc1802@gmail.com', 'Hey', 'You are dangerous.', function() {
		console.log('haha');
	});
}

checkData("line");
