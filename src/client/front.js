(function (win) {
	var data, dataAddr, obj;

	data = {};
	obj = {};
	dataAddr = 'http://chart.kr.pe/data.json';
	pieInfo = {
		heart: {
			labels: ["low", "mid", "high"],
			cuts: [25, 50]
		},
		temp: {
			labels: ["low", "mid", "high"],
			cuts: [25, 50]
		},
		sleep: {
			labels: ["low", "mid", "high"],
			cuts: [25, 50]
		}
	}

	// Get data from the json file in the local server
	function getData(callback) {
    var xmlHttp = new XMLHttpRequest();

		xmlHttp.onreadystatechange = function() {
			if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
				data = JSON.parse(xmlHttp.responseText);
				callback();
			} 
		};
		xmlHttp.open("GET", dataAddr, true);
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
		} else {
        currObj.backgroundColors = ["rgb(200, 200, 200)"];
        currObj.chartColors = ["#002b33", "#0080cc", "#0054cc"];
        currObj.backgroundGradation = false;
        currObj.chartGradation = true;
	      currObj.animation = true;
				currObj.offset = (offset = parseAttr(elem, "offset")) ? offset : 50;

			if (type == "line" || type == "bar") {
				currObj.range = (range = parseAttrs(elem, "range")) ? range : [-50, 50];
				currObj.maxChartElem = (max = parseAttr(elem, "max")) ? max : 20;
 				currObj.axis = [-50, -25, 0, 25, 50];
 				currObj.lineShape = "step"
			} else if (type == "pie") {
//				currObj.pieRadius = 250;
				currObj.labels = pieInfo[target].labels;
			}
		}
	}

	function parseSetForPie(target) {
		var set = data[target];
		var cuts = (pieInfo[target].cuts).sort();
		var cnts = [];
		var size = cuts.length + 1;
		while(size--) cnts[size] = 0;

		for (i = 0; i < set.length; i++) {
			var value = set[i];
			var found = false;

			for (j = 0; j < cuts.length; j++) {
				if (value < cuts[j]) {
					cnts[j]++;
					found = true;
					break;
				}
			}

			if (!found) {
				cnts[cnts.length - 1]++;
			}
		}

		return cnts;
	}

	function drawCharts() {
		for (target in obj) {
			for (type in obj[target]) {
				if (type != "animation") {
					var currObj = obj[target][type];

					if (type == "line" || type == "bar") {
						currObj.data = data[target];
					} else {
						currObj.data = parseSetForPie(target)
					}
					win.JCLib.draw(currObj);
				}
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
