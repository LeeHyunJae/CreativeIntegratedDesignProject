// Modules
var fs = require('fs');
var mqtt = require('mqtt');
var moment = require('moment');
var mysql = require('./mysql');

// Global variables
var config = {};
var data = {};
var time = {
	temp: {},
	heart: {},
	sleep: {}
};

// Push a element into a set
function push(set, elem, len) {
	set.push(elem);
	if (set.length > len) {
		set.shift();
	}
}

// Insert a element with type
// Data which arrived before (prevTime + interval) are discarded
function insertRealTime(target, type, currTime, value) {
	var interval = config[target][type].interval;
	var length = config[target][type].length;

	if (!time[target][type]) {
		time[target][type] = currTime;
		push(data[target][type], value, length);
	}	
	else {
		var prevTime = time[target][type];
		var plusTime = prevTime.add(interval[0], interval[1]);

		if (plusTime.isBefore(currTime)) {
			time[target][type] = plusTime;
			push(data[target][type], value, length);
		}
	}
}

// Insert a element into a dataset
function insertData(newData) {
	var target = newData.target;
	var currTime = moment(newData.time);
	var value = newData.value;

	insertRealTime(target, "line", currTime, value);
	insertRealTime(target, "bar", currTime, value);
	insertRealTime(target, "pie", currTime, value);
}

// Write data to a file
function writeData(data) {
  fs.writeFile('../client/data.json', JSON.stringify(data), function(err) {
		if (err) throw err;
  });
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
		data[target] = {};
		for (type in config[target]) {
			data[target][type] = [];
		}
	}
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
client.on('message', function (topic, message) {
	var newData = JSON.parse(message);
	newData.time = moment().format("YYYY-MM-DD HH:mm:ss");

	insertData(newData);
	writeData(data);

	var str = 'insert into data set ?';
	var query = connection.query(str, newData, function(err, result) {
	});
});
