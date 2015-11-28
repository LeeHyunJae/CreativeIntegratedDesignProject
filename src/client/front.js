(function (win) {
	var data, obj;

	data = {};
	obj = {};

	// Get data from the json file in the local server
	function getData(callback) {
    var xmlHttp = new XMLHttpRequest();
		var address = 'http://chart.kr.pe/jaedong/src/client/haha.json';

		xmlHttp.onreadystatechange = function() {
			if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
				data = JSON.parse(xmlHttp.responseText);
				console.log(data)
				callback();
			} 
		};
		xmlHttp.open("GET", address, true);
		xmlHttp.send();
	}

	// Parse an attribute from an element
	function parseAttr(elem, attr) {
		var val = elem.getAttribute(attr);
		return val ? val : null;
	}

	// Parse multiple attributes from an element
	function parseAttrs(elem, attr) {
		var val = elem.getAttribute(attr);
		return val ? val.replace(/, +/g, " ").split(/ +/g) : null;
	}

	// Initialize all charts and animations
	function init(elem) {
		var target, type, currObj;

		elem.width = elem.width;

		target = parseAttr(elem, "target");
		type = parseAttr(elem, "type");		

		if (!obj[target]) obj[target] = {};
		if (!obj[target][type]) obj[target][type] = {};
		currObj = obj[target][type];

		currObj.target = target;
		currObj.type = type;
		currObj.width = elem.width;
		currObj.height = elem.height;
		currObj.ctx = elem.getContext("2d");

		if (type == "animation") {
			currObj.theme = (theme = parseAttr(elem, "theme")) ? theme : 0
			currObj.delay = (delay = parseAttr(elem, "delay")) ? delay : 200

			win.JCAnim.setup(currObj);
		} 
		else if (type == "line" || type == "bar" || type == "pie") {
			currObj.range = (range = parseAttrs(elem, "range")) ? range : [-50, 50];
			currObj.offset = (offset = parseAttr(elem, "offset")) ? offset : 50;
			currObj.maxChartElem = (max = parseAttr(elem, "max")) ? max : 20;
 			currObj.backgroundColors = ["rgba(100, 150, 200, 1)"]//["rgba(200, 200, 200, 1)", "rgba(200, 20, 200, 1)"];
 			currObj.chartColors = ["#002b33", "#0080cc"];
 			currObj.backgroundGradation = false;
 			currObj.chartGradation = false;
 			currObj.axis = [-50, -25, 0, 25, 50];
 			currObj.lineShape = "smooth"
 			currObj.pieRadius = 250;
			currObj.animation = true;
		}
	}

	function drawCharts() {
		for (target in obj) {
			for (type in obj[target]) {
				if (type == "animation") continue;
				var currObj = obj[target][type];

			//	console.log(data[target])
				currObj.data = data[target][type];
				//console.log(type + " " + currObj.backgroundColors);
				win.JCLib.draw(currObj);
			}
		}

		setTimeout(function() {
			getData(function() {
				drawCharts();
			})
		}, 1000);
	}

	// Jcharts API
	JCFront = {
	    render: function(elems) {
				elems = document.querySelectorAll(".jchart");
				
	      for (var i = 0; i < elems.length; i++) {
	        init(elems[i]);
	      }

				getData(function() {
					drawCharts();
				});
				win.JCAnim.draw();
	    }
	};

	win.JCFront = JCFront;
})(window);
