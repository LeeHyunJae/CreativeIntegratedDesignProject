(function (win) {
	var data;

	function getData() {
    var xmlHttp = new XMLHttpRequest();
		var address = 'http://chart.kr.pe/project/chart_library/data.json';

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
		var obj = {
			type: parseAttr(elem, "data-type")[0],
			width: elem.width,
			height: elem.height,
			ctx: elem.getContext("2d"),
			data: data.line,
			range: [-50, 50],
			offset: 50,
			maxChartElem: 20
		}

		elem.width = elem.width;
		window.JCLib.draw(obj);
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
