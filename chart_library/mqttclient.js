(function (win) {
	var MQTT, mqttClient, data;

	data = [];

	mqttClient = new Paho.MQTT.Client("cloud2logic.com", 1884, "clientId");

	// set callback handlers
	mqttClient.onConnectionLost = onConnectionLost;
	mqttClient.onMessageArrived = onMessageArrived;
		
	//connect to server
	mqttClient.connect({onSuccess:onConnect});
		
	//called when the connection is made
	function onConnect() {
		console.log("OnConnect");
		
		mqttClient.subscribe("project/test");
	}
		
	// called when the client loses its connection
	function onConnectionLost(responseObject) {
	  if (responseObject.errorCode !== 0) {
	    console.log("onConnectionLost: " + responseObject.errorMessage);
	  }
	}

	// called when a message arrives
	function onMessageArrived(message) {
//		console.log("onMessageArrived: " + message.payloadString);
		var d = JSON.parse(message.payloadString);
		data.push(+d.value);
//		data.push(JSON.parse(message.payloadString));
		console.log("data arrived: " + d);
	}

	MQTT = {
		getData: function() {
			console.log(data);
			return data;
		}
	};

	window.MQTT = MQTT;
} (window));