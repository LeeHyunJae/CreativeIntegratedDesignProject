(function (win) {
	var data = {};
	var objs = [];
	var dataAddr = 'http://chart.kr.pe/data.json';
	var pieInfo = {
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
	var dangerRange = {
		heart: [25, 50],
		temp: [25, 50],
		sleep: [25, 50]
	}

	// Get data from the json file in the local server
	function getDataAndDraw() {
    var xmlHttp = new XMLHttpRequest();

		xmlHttp.onreadystatechange = function() {
			if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
				data = JSON.parse(xmlHttp.responseText);
				drawCharts();
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
	function parseOpts(elem, attr) {
		var val = elem.getAttribute(attr);
		var options = val ? val.replace(/ +/g, " ").split(/ /g) : null;
		var result = {};

		if (!options) return null;
		
		for (i in options) {
			var x = options[i].split(":");
			var opt = eraseHyphen(x[0]);
			result[opt] = x[1];
		}
		return result;
	}

	function eraseHyphen(string) {
		var str = string.toLowerCase();

		return str.replace(/-([a-z])/g, 
			function (g) { 
				return g[1].toUpperCase(); 
			});
	}

	function showPopup(event) {
		var currObj = findObjForEvent(event);
		var txts = [
			getTypeString(currObj.type) + " of " + getTargetString(currObj.target) + "\n",
			"Data: " + currObj.data
		];
		var txt = txts.reduce(function(a, b) { return a + b; }, "");

		window.alert(txt);
	}

	function getTargetString(target) {
		if (target == "temp") return "Temperature";
		else if (target == "heart") return "Heartbeat";
		else if (target == "sleep") return "Sleeping Time";
		else return "";
	}

	function getTypeString(type) {
		if (type == "line") return "Line chart";
		else if (type == "bar") return "Bar chart";
		else if (type == "pie") return "Pie chart";
		else if (type == "animation") return "Animation";
		else return "";
	}

	function findObjForEvent(event) {
		var foundObj = null;

		for (i in objs) {
			var currObj = objs[i];
			var elem = currObj.elem;
      var rect = elem.getBoundingClientRect();
      var posX = event.clientX - rect.left;
      var posY = event.clientY - rect.top;

      if (posX > 0 && posX < elem.width && posY > 0 && posY < elem.height) {
				foundObj = currObj;
				break;
      }
    }
		
		return foundObj;
	}

	// Initialize all charts and animations
	function init(elem) {
		var target = parseAttr(elem, "target");
		var type = parseAttr(elem, "type");		
		var options = parseOpts(elem, "options");
		var newObj = {};

		newObj.elem = elem;
		newObj.target = target;
		newObj.type = type;
		newObj.width = elem.width;
		newObj.height = elem.height;
		newObj.ctx = elem.getContext("2d");

		newObj.chartColorIdx = 0;

		for (opt in options) {
			newObj[opt] = options[opt];
		}

		objs.push(newObj);
		elem.addEventListener("mousedown", showPopup, false);
	}

	function startAnims() {
		for (i in objs) {
			if (objs[i].type == "animation") {
       win.JCAnim.setup(objs[i]);
			}
		}
		win.JCAnim.draw();
	}

	function parseSetForPie(target) {
		var set = data[target].slice(0);
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

	function isDangerous(target) {
		var d = data[target];
		var last = d[d.length - 1];
		var range = dangerRange[target];

		if (last < range[0]) return 'low';
		else if (last > range[1]) return 'high';
		else return 'norm';
	}

	function drawCharts() {
		for (i in objs) {
			var obj = objs[i];
			var target = obj.target;
			var type = obj.type;

			if (isDangerous(target) == 'low') {
				obj.danger = true;
				win.JCAnim.setDangerous(target, 'low');
			} else if (isDangerous(target) == 'high') {
				obj.danger = true;
				win.JCAnim.setDangerous(target, 'high');
			} else {
				obj.danger = false;
				win.JCAnim.setDangerous(target, 'norm');
			}

			if (type != "animation") {
				if (type == "line" || type == "bar") {
					if (obj.chartColors) {
						obj.chartColorIdx = (obj.chartColorIdx + 1) % obj.chartColors.length;
					} else {
						obj.chartColorIdx = (obj.chartColorIdx + 1) % 4;
					}
					obj.data = data[target];
				} else {
					obj.data = parseSetForPie(target)
				}
				//console.log(obj)
				win.JCLib.draw(obj);
			}
		}

		setTimeout(function() {
			getDataAndDraw();
		}, 1000);
	}

	// Jcharts API
	JCFront = {
		render: function(elems) {
			elems = document.querySelectorAll(".jchart");	

	    for (var i = 0; i < elems.length; i++) {
	      init(elems[i]);
	    }

			getDataAndDraw();
			startAnims();
	  }
	};

	win.JCFront = JCFront;
})(window);
