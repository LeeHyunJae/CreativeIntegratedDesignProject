(function (win) {
	var data;

	function getData() {
    var xmlHttp = new XMLHttpRequest();
		var address = 'http://chart.kr.pe/jaedong/src/client/data.json';

		xmlHttp.onreadystatechange = function() {
			if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
				data = JSON.parse(xmlHttp.responseText);
			} 
		};
		xmlHttp.open("GET", address, true);
		xmlHttp.send();
	}

	// Parsing functions
	function parseAttr(elem, attr) {
		var val = elem.getAttribute(attr);

		return val ? val.replace(/, +/g, " ").split(/ +/g) : null;
	}
	
	function init(elem) {
		var target, type, obj;

		console.log("elem : "+elem);

		target = parseAttr(elem, "target")[0];
		type = parseAttr(elem, "type")[0];		
		obj = {};

		elem.width = elem.width;

		obj.target = target;
		obj.type = type;
		obj.width = elem.width;
		obj.height = elem.height;
		obj.ctx = elem.getContext("2d");

		if (type == "animation") {
			obj.theme = 1;

			win.JCAnim.draw(obj);
		} else if (type == "line" || type == "bar" || type == "pie") {
			obj.range = [-50, 50];
			obj.offset = 50;
			obj.maxChartElem = 20;
			obj.data = data[type];

			obj.backgroundColors = [[200, 200, 200], [200, 20, 200]];
			obj.chartColors = ["#002b33", "#0080cc"];
			obj.backgroundGradation = false;
			obj.chartGradation = false;
			obj.axis = [-50, -25, 0, 25, 50];
			obj.lineShape = "smooth"
			obj.pieRadius = 250;

			win.JCLib.draw(obj);
		}
	}

	// Get the initial data
	getData();

	// Jcharts API
	JCFront = {
	    render: function(elems) {
				getData();

	      if (!elems) {
	        elems = document.querySelectorAll(".jchart");
	      }

	      for (var i = 0; i < elems.length; i++) {
	        init(elems[i]);
	      }
	    }
	};

	win.JCFront = JCFront;
})(window);
