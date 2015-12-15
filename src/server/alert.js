// Modules
var moment = require('moment');
var mysql = require('./mysql');
var connection = mysql.connection;
var mail = require('./mail');
var sms = require('./sms');

// Variables
var data = {
	"temp": [],
	"heart": [],
	"sleep": []
}
var length = {
	"temp": [10, "s"],
	"heart": [10, "s"],
	"sleep": [10, "s"]
}

// Check if a user is dangerous or not
function isDangerous(target) {
	var currData = data[target];
	var avg = currData.reduce(function(a, b) {
		return a + b;
	}) / currData.length;

	if (target == "temp") {
		return (avg >= 40 || avg <= 35) ? true : false;
	} else if (target == "heart") {
		return (avg >= 200 || avg <= 50) ? true : false;
	} else {
		return (avg >= 100 || avg <= 0) ? true : false;
	}
}

// Get data and check
function checkData() {
	var query = 'select value from data where target=? and time>=?';
	var dateFormat = 'YYYY-MM-DD HH:mm:ss';

	for (target in data) {
		var len = length[target];
		var time = moment().subtract(len[0], len[1]).format(dateFormat);

		(function(target) {
			connection.query(query, [target, time], function(err, rows) {
				data[target] = [];
				for (i in rows) {
					data[target].push(rows[i].value);
				}
				if (data[target].length > 0 && isDangerous(target)) {
					warn();
				}	
			});
		})(target);
	}

	setTimeout(function() {
		checkData();
	}, 60000);
}

// Warn the user
function warn() {
	sms.send('010-5564-3754', 'You are dangerous.', function() {
		console.log("The message has been sent.");
	});
	mail.send('ysc1802@gmail.com', 'Hey', 'You are dangerous.', function() {
		console.log('haha');
	});
}

// Start monitoring
checkData();
