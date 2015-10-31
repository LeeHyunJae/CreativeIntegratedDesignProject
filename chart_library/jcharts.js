/*
	Jcharts
	Seoul National University
*/
(function (win) {
	/*
		Shared data
	*/
	var data, dataMaxLne;

	data = {
		"line" : []
	};
	dataMaxLen = 10;

	function push(type, elem) {
		data[type].push(elem);

		while (data[type].length > dataMaxLen) {
			data[type].shift();
		}

		console.log(data[type]);
	}

	/*
		MQTT Part
	*/
	var MQTT, mqttClient;

	mqttClient = new Paho.MQTT.Client("cloud2logic.com", 1884, "jchart");
	mqttClient.onConnectionLost = onConnectionLost;
	mqttClient.onMessageArrived = onMessageArrived;
	mqttClient.connect({onSuccess:onConnect});

	function onConnect() {
		console.log("MQTT connected");
		
		mqttClient.subscribe("project/test");
	}
		
	function onConnectionLost(responseObject) {
	  if (responseObject.errorCode !== 0) {
	    console.log("onConnectionLost: " + responseObject.errorMessage);
	  }
	}

	function onMessageArrived(message) {
		var json, arr;

		json = JSON.parse(message.payloadString);
		console.log("data arrived: " + JSON.stringify(json));
		push(json.type, json.value);
	}

	/*
		Graph part
	*/
	var Jcharts, ctx, type, range, width, height, renderers;

	range = [0, 0];
	renderers = {
		"line" : renderLineChart
	};

	// Parsing functions
	function parseAttr(elem, attr) {
		var val = elem.getAttribute(attr);

		return val ? val.replace(/, +/g, " ").split(/ +/g) : null;
	}
/*
	function parseSet(str) {
		var set, i, j;

		set = str.match(/[-\d\.]+/g);
		if (set == null) {
			set = [1];
		}

		for (i = 0; i < set.length; i++) {
			set[i] = +set[i];
		}

		return set;
	}
*/
	// Computing range functions
	function getRange(set) {
		return [Math.min.apply(null, set), Math.max.apply(null, set)];
	}

	// Drawing line chart functions
	function getXStep(len) {
		return width / (len - 1);
	}

	function getXForIndex(idx, len) {
		return idx * getXStep(len);
	}

	function getYForValue(val) {
		return height - (height * ((val - range[0]) / (range[1] - range[0])));
	}

	function drawLineSegment(x, y) {
		ctx.lineTo(x, y);
	}

	function drawLineForSet(set) {
		var i = 0, x, y, step;

		step = getXStep(set.length);

		ctx.lineWidth = 3;
		ctx.lineJoin = "round";
		ctx.beginPath();
		ctx.strokeStyle = "#bbb";
		ctx.moveTo(0, getYForValue(set[0]));

		while (++i < set.length) {
			x = getXForIndex(i, set.length);
			y = getYForValue(set[i]);

			drawLineSegment(x, y);
		}

		ctx.stroke();
	}

	function renderLineChart(set) {
		drawLineForSet(set);
	}

	function renderBarChart() {
	    var i, j, p, a, x, y, w, h, len;

	    //drawAxis();
	    ctx.lineWidth = 10;
	    ctx.lineJoin = "miter";

	    len = set.length;

		console.log("len: " + len);
	    for (i = 0; i < set.length; i++) {
	//      for (j = 0; j < len; j++) {
	        p = 1;
	        w = 1;
	        x = i*20;
	        y = getYForValue(set[i]);
	        h = y - getYForValue(0) || 1;

	        console.log("debug! x:" + x + " y : " + y + "  w : " + w + "  h:  "  + h);
	        ctx.fillStyle = "#FF0000";
	        ctx.fillRect(x, y - h, w*10, h);
	// 		}
	    }
	 }


	// Initiation functions
	function init(elem) {
		var i;

		type = parseAttr(elem, "data-type")[0];
		set = data[type];
		range = parseAttr(elem, "data-range") || getRange(set);
		width = elem.width;
		height = elem.height;
		ctx = elem.getContext("2d");

		// erase
		elem.width = elem.width;

		try {
			renderers[type](set);
		} catch (e) {
			console.error(e.message);
		}
	}

	// Jcharts API
	Jcharts = {
	    render: function(elems) {
	      var i;

	      if (!elems) {
	        elems = document.querySelectorAll(".jchart");
	      }

	      for (i = 0; i < elems.length; i++) {
	        init(elems[i]);
	      }
	    },

	    update: function() {
	    	var i, elems;

	    	elems = document.querySelectorAll(".jchart");
	    	this.render(elems);
	    }
	};

	win.Jcharts = Jcharts;
})(window);