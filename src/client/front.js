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
			cuts: [37.9, 38.1]
		},
		sleep: {
			labels: ["Non-slept", "Well-slept", "Bad-slept"],
			cuts: [0, 100]
		}
	}
	var dangerRange = {
		heart: [40, 100],
		temp: [35.5, 37.5],
		sleep: [0, 100]
	}

	// Get data from the json file in the local server
	function getDataAndDraw() {
    var xmlHttp = new XMLHttpRequest();

		xmlHttp.onreadystatechange = function() {
			if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
				var newData = (JSON.parse(xmlHttp.responseText));

				for (var target in newData) {
					newData[target] = newData[target].map(function(v) {
						return v * 1;
					});
					if (!data[target] || !areSameArray(data[target], newData[target])) {
						data[target] = newData[target];
						drawDynamicCharts(target);
					}
				}

				setTimeout(function() {
					getDataAndDraw();
				}, 500);
			} 
		};
		xmlHttp.open("GET", dataAddr, true);
		xmlHttp.send();
	}

	function areSameData(d1, d2) {
		var targets = ["heart", "temp", "sleep"];
		for (var i in targets) {
			var t = targets[i];
			if ((!d1[t]) || (!d2[t]) || (!areSameArray(d1[t], d2[t]))) return false;
		}
		return true;
	}
	
	function areSameArray(arr1, arr2) {
		if (arr1.length != arr2.length) return false;
		for (var i = 0; i < arr1.length; i++) {
			if (arr1[i] != arr2[i]) return false;
		}
		return true;
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

	function getAverage(arr) {
		return arr.reduce(function(a, b) {
			return a + b;
		}, 0) / arr.length;
	}

	function getStdDev(arr) {
		var avg = getAverage(arr);
		var sqrDiffs = arr.map(function(v) {
			var diff = v - avg;
			return diff * diff;
		});
		var avgSqrDiff = getAverage(sqrDiffs);
		
		return Math.sqrt(avgSqrDiff);
	}

	function cutOff(arr, len) {
		var newArr = arr.slice(0);

		while (newArr.length > len) {
			newArr = newArr.slice(1, newArr.length);
		}
		return newArr;
	}

	function showPopup(event) {
		var currObj = findObjForEvent(event);

		if (currObj) {
			var currData = currObj.data.slice(0);
			var txts, txt;
			var avg, stdDev;

			if (currObj.dataLength) {
				currData = cutOff(currData, currObj.dataLength);
			}

			avg = getAverage(currData);
			stdDev = getStdDev(currData);

			txts = [
				getTypeString(currObj.type) + " of " + getTargetString(currObj.target) + "\n",
				"Data length: " + currData.length + "\n",
				"Average: " + avg.toFixed(2) + "\n",
				"Standard deviation: " + stdDev.toFixed(2)
			];
			txt = txts.reduce(function(a, b) { return a + b; }, "");

			window.alert(txt);
		}
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

		if (foundObj.type == "animation") {
			foundObj = null;
		}
		
		return foundObj;
	}

	// Initialize all charts and animations
	function init(elem) {
		var target = parseAttr(elem, "target");
		var type = parseAttr(elem, "type");		
		var options = parseOpts(elem, "options");
		var data = parseAttr(elem, "data");
		var newObj = {};

		newObj.elem = elem;
		newObj.target = target;
		newObj.type = type;
		newObj.width = elem.width;
		newObj.height = elem.height;
		newObj.ctx = elem.getContext("2d");

		newObj.dataOn = (data && type != "animation") ? true : false;
		if (newObj.dataOn) {
			var newData = data.split(",").map(function(v) {
				return v * 1;
			});
			newObj.data = newData;
		}

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

	function drawStaticCharts() {
    for (i in objs) {
      var obj = objs[i];

			if (obj.dataOn) {
				obj.danger = false;
				obj.chartColorIdx = 0;
				win.JCLib.draw(obj);
			}
    }
	}

	function drawDynamicCharts(target) {
		for (i in objs) {
			var obj = objs[i];
			var objTarget = obj.target;
			var type = obj.type;

			if (obj.dataOn) continue;
			if (objTarget != target) continue;

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

			if (type == "line" || type == "bar") {
				if (obj.chartColors) {
					obj.chartColorIdx = (obj.chartColorIdx + 1) % obj.chartColors.length;
				} else {
					obj.chartColorIdx = (obj.chartColorIdx + 1) % 4;
				}
				obj.data = data[target];
			} else {
				obj.data = [17, 3, 4];
				//obj.data = parseSetForPie(target)
			}

			if (type != "animation") {
				win.JCLib.draw(obj);
			}
		}
	}

	// Jcharts API
	JCFront = {
		render: function(elems) {
			elems = document.querySelectorAll(".jchart");	

	    for (var i = 0; i < elems.length; i++) {
	      init(elems[i]);
	    }

			drawStaticCharts();
			getDataAndDraw();
			startAnims();
	  }
	};

	win.JCFront = JCFront;
})(window);
