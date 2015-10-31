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
		"line" : [],
		"bar" : [],
		"pie" : []
	};
	dataMaxLen = 20;

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
	var Jcharts, ctx, type, range, width, height, renderers, offset;

	range = {
		"line" : [0, 150],
		"bar" : [0, 100],
		"pie" : [0, 100]
	}
	renderers = {
		"line" : renderLineChart,
		"bar" : renderBarChart,
		"pie" : renderBarChart
	};
	offset = 50;

	// Parsing functions
	function parseAttr(elem, attr) {
		var val = elem.getAttribute(attr);

		return val ? val.replace(/, +/g, " ").split(/ +/g) : null;
	}
	
	// Drawing line chart functions
	function getXStep(len) {
		return (width - 2 * offset) / (len - 1);
	}

	function getXForIndex(idx, len) {
		return offset + idx * getXStep(len);
	}

	function getYForValue(val, range) {
		var h = height - 2 * offset;

		return h - (h * ((val - range[0]) / (range[1] - range[0]))) + offset;
	}

	function drawAxis(vals, range) {
		var i, val, h;

		for (i = 0; i < vals.length; i++) {
			val = vals[i];
			h = getYForValue(val, range);

			ctx.font = "20px Consolas";
			ctx.fillText(val, 10, h + 5);

			ctx.strokeStyle = "FF0000";
			ctx.moveTo(offset, h);
			ctx.lineTo(width - offset, h)
			ctx.stroke();
		}
	}

	function drawAxisForLine() {

	}

	function drawAxisForBar() {

	}

	function sumSet(set) {
		var i, n = 0;

		for (i = 0; i < set.length; i++) {
			n += set[i];
		}
	
		return n;
	}

	// Render a pie chart
	function renderPieChart() {
		var i, x, y, r, a1, a2, sum;
	
		x = width / 2;
		y = height / 2;
		r = Math.min(x, y) - 2;
		a1 = 1.5 * Math.PI;
		a2 = 0;
		sum = sumSet(set);

		for (i = 0; i < set.length; i++) {
			ctx.fillStyle = colors[i];
			ctx.beginPath();
			a2 = a1 + (set[i] / sum) * (2 * Math.PI);

			// TODO opts.wedge
			ctx.arc(x, y, r, a1, a2, false);
			ctx.lineTo(x, y);
			ctx.fill();
			a1 = a2;
		}
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
		ctx.moveTo(offset, getYForValue(set[0], range.line));

		while (++i < set.length) {
			x = getXForIndex(i, set.length);
			y = getYForValue(set[i], range.line);

			drawLineSegment(x, y);
		}

		ctx.stroke();
	}

	function renderLineChart(set) {
		drawAxis([0, 50, 100, 150], range.line);
		drawLineForSet(set);
	}

	function renderBarChart() {
	    var i, j, p, a, x, y, w, h, len;
		var max_elem, interval, x_offset;

	    //drawAxis();
	    ctx.lineWidth = 10;
	    ctx.lineJoin = "miter";

	    len = set.length;

		x_offset = 50;
		max_elem = 20;
		interval = (width - (2*x_offset)) / max_elem;
		
		console.log("len: " + len);
	    for (i = 0; i < set.length; i++) {
	//      for (j = 0; j < len; j++) {
	        p = 1;
	        w = 1;
	        x = len < max_elem ? (i + max_elem - len) * interval : i*interval;
	        y = getYForValue(set[i]);
	        h = y - getYForValue(0) || 1;

	        console.log("debug! x:" + x + " y : " + y + "  w : " + w + "  h:  "  + h);
	        ctx.fillStyle = "#FF0000";
	        ctx.fillRect(x_offset + x, y - h, w*(interval-2), h);
	// 		}
	    }
	 }


	// Initiation functions
	function init(elem) {
		var i;

		type = parseAttr(elem, "data-type")[0];
		width = elem.width;
		height = elem.height;
		ctx = elem.getContext("2d");

		// erase
		elem.width = elem.width;

		try {
			renderers[type](data[type]);
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
