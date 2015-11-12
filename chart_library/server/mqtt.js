// Modules
var fs = require('fs');
var mqtt = require('mqtt');
var moment = require('moment');
var mysql = require('./mysql');

// Useful functions
function push(data, config, type, elem) {
  data[type].push(elem);
  while (data[type].length > config[type].maxLength) {
    data[type].shift();
  }
}

function writeData(data) {
  fs.writeFile('../data.json', JSON.stringify(data), function(err) {
		if (err) throw err;
  });
}

// Connect to MQTT
var client = mqtt.connect('tcp://chart.kr.pe');

// Connect to MYSQL
var connection = mysql.connection;

// Read config
var config = {};
var data = {};

(function() {
	var result = fs.readFileSync('../config.json', 'utf-8');
	config = JSON.parse(result);
	for (type in config) {
		data[type] = [];
	}
})();

// Get data from MYSQL
for (var type in data) {
	(function(type) {
		connection.query('select * from data where type=?', [type], function(err, rows) {
			for (var i in rows) {
				push(data, config, type, rows[i].value);
			}
			writeData(data);
		});
	})(type);
}

// Set MQTT callback functions
client.on('connect', function () {
	console.log('MQTT connected');
	client.subscribe('project/test');
});

client.on('message', function (topic, message) {
	var newData = JSON.parse(message);
	newData.time = moment().format("YYYY-MM-DD HH:mm:ss");

	push(data, config, newData.type, newData.value);
	writeData(data);

	var str = 'insert into data set ?';
	var query = connection.query(str, newData, function(err, result) {
		if (err) throw err;
	});
});
