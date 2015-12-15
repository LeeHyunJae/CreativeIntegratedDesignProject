// Modules
var fs = require('fs');
var mqtt = require('mqtt');
var moment = require('moment');
var mysql = require('./mysql');

// Addresses
var dataAddr = '/var/www/html/data.json';
var dataAddr2 = '/var/www/html/jaedong/src/client/data.json';

// Global variables
var config = {};
var data = {};
var time = {};

// Push a element into a set
function push(set, elem, len) {
	set.push(elem);
	if (set.length > len) {
		set.shift();
	}
}

// Insert a element
// Data which arrived before (prevTime + interval) are discarded
function insertRealTime(target, currTime, value) {
	var interval = config[target].interval;
	var length = config[target].length;

	if (!time[target]) {
		time[target] = currTime;
		push(data[target], value, length);
	}	
	else {
		var prevTime = time[target];
		var plusTime = moment(prevTime).add(interval[0], interval[1]);

		if (plusTime.isBefore(currTime)) {
			time[target] = plusTime;
			push(data[target], value, length);
		}
	}
}

// Insert a element into a dataset
function insertData(newData) {
	var target = newData.target;
	var currTime = moment(newData.time);
	var value = newData.value;

	insertRealTime(target, currTime, value);
}

// Write data to a file
function writeData(data) {
  fs.writeFile(dataAddr, JSON.stringify(data), function(err) {
		if (err) throw err;
  });
}

// Print config for debugging
function printConfig() {
	for (i in config) {
		for (j in config[i]) {
			console.log("- config[" + i + "][" + j + "]: " + JSON.stringify(config[i][j]))
		}
	}
}

// Connect to MQTT
var client = mqtt.connect('tcp://chart.kr.pe');

// Connect to MYSQL
var connection = mysql.connection;

// Read config
(function() {
	var result = fs.readFileSync('config.json', 'utf-8');
	config = JSON.parse(result);

	for (target in config) {
		data[target] = [];
	}

	console.log("Read config")
	printConfig()
})();

// Get data from MYSQL
for (var target in data) {
	(function(target) {
		connection.query('select * from data where target=?', [target], function(err, rows) {
			for (var i in rows) {
				insertData(rows[i]);
			}
			writeData(data);
		});
	})(target);
}

// Set MQTT callback functions
client.on('connect', function () {
	console.log('MQTT connected');
	client.subscribe('project/test');
});

// Listen to the MQTT client
// Data should be { target: T, value: V }
client.on('message', function (topic, message) {
	var newData = JSON.parse(message);
	newData.time = moment().format("YYYY-MM-DD HH:mm:ss");

	insertData(newData);
	writeData(data);

	// console.log("Received: " + message)

	var str = 'insert into data set ?';
	var query = connection.query(str, newData, function(err, result) {
	});
});
