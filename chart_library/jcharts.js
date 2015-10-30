/*
	Jcharts
	Seoul National University
*/
(function (win) {
var Jcharts, ctx, type, set, range, width, height, renderers;

renderers = {
	"line" : renderLineChart
}

// Parse attributes : "a, b, c" -> ["a", "b", "c"]
function parseAttr(elem, attr) {
	var val = elem.getAttribute(attr);

	return val ? val.replace(/, +/g, " ").split(/ +/g) : null;
}

// Parse a set : "[1, 1, 3]" -> [[1, 2, 3]]
function parseSet(str) {
	var set, i, j;

	set = str.match(/[-\d\.]+/g);
	for (i = 0; i < set.length; i++) {
		set[i] = +set[i];
	}

	return set;
}

function drawLineSegment(x, y) {
	ctx.lineTo(x, y);
}

function drawLineForSet(set) {
	var i = 0, x, y;

	ctx.lineWidth = 3;
	ctx.lineJoin = "round";
	ctx.beginPath();
	ctx.strokeStyle = "#bbb";
	ctx.moveTo(0, 0);

	while (++i < set.length) {
		x = i * 10;
		y = set[i] * 10;

		drawLineSegment(x, y);
	}

	ctx.stroke();
}

// Render a line chart
function renderLineChart(set) {
	drawLineForSet(set);
}

function init(elem) {
	type = parseAttr(elem, "data-type")[0];
	set = parseSet(elem.getAttribute("data-set"));
	range = parseAttr(elem, "data-range");
	width = elem.width;
	height = elem.height;
	ctx = elem.getContext("2d");

	try {
		renderers[type](set);
	} catch (e) {
		console.error(e.message);
	}

	console.log("type: " + type);
	console.log("set: " + set);
	console.log("range: " + range);
	console.log();
}

Jcharts = {
	// render
    render: function(elems) {
      var i;

      if (!elems) {
        elems = document.querySelectorAll(".jchart");
      }

      for (i = 0; i < elems.length; i++) {
        init(elems[i]);
      }
    },
};

win.Jcharts = Jcharts;

})(window);/*initial commit*/
