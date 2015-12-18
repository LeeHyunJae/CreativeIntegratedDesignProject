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
		return (avg >= 37.5 || avg <= 35.5) ? true : false;
	} else if (target == "heart") {
		return (avg >= 100 || avg <= 40) ? true : false;
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
					console.log("You are dangerous in " + target);
					warn(target);
				}	else {
					console.log("You are normal in " + target);
				}
			});
		})(target);
	}

	setTimeout(function() {
		checkData();
	}, 10000);
}

// Warn the user
function warn(target) {
	var msg = "";

	if (target == 'temp') msg = "Your body temperature is too high!";
	else if (target == 'heart') msg = "Your heart is beating too fast!";
	else msg = "You haven't slept very well!";

	sms.send('010-5564-3754', msg, function() {
		console.log("The message has been sent.");
	});
	mail.send('ysc1802@gmail.com', 'You are in danger!', msg, function() {
		console.log('haha');
	});
}

// Start monitoring
checkData();
