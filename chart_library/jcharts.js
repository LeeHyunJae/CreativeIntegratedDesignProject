/*
	Jcharts
	Seoul National University
*/
(function (win) {
var Jcharts, ctx, type, set, range, width, height, renderers;

renderers = {
	"line" : renderLineChart,
	"bar" : renderBarChart
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

 // Render a bar chart
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

 function getYForValue(val) {
    var h = height;

    return h - (h * ((val - range[0]) / (range[1] - range[0])));
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
	console.log("width: " + width);
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
