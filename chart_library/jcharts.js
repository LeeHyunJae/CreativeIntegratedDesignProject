/*
	Jcharts
	Seoul National University
*/
(function (win) {
var Jcharts, ctx, type, set, range, width, height, renderers, colors, themes;

range = [0, 0];
renderers = {


// Parsing functions
	"line" : renderLineChart,
	"bar" : renderBarChart,
	"pie": renderPieChart
}


  themes = {
    "blues":  ["#7eb5d6", "#2a75a9", "#214b6b", "#dfc184", "#8f6048"],
    "money":  ["#009b6d", "#89d168", "#d3eb87", "#666666", "#aaaaaa"],
    "circus": ["#9351a4", "#ff99cc", "#e31a1c", "#66cdaa", "#ffcc33"],
    "party":  ["#ffcc00", "#ff66cc", "#3375cd", "#e43b3b", "#96cb3f"],
    "garden": ["#3c7bb0", "#ffa07a", "#2e8b57", "#7eb5d6", "#89d168"],
    "crayon": ["#468ff0", "#ff8000", "#00c000", "#ffd700", "#ff4500"],
    "ocean":  ["#3375cd", "#62ccb2", "#4aa5d5", "#a6cee3", "#ffcc33"],
    "spring": ["#ed729d", "#72caed", "#9e9ac8", "#a6d854", "#f4a582"],
    "beach":  ["#f92830", "#2fb4b1", "#ffa839", "#3375cd", "#5fd1d5"],
    "fire":   ["#dc143c", "#ff8c00", "#ffcc33", "#b22222", "#cd8540"]
  };

	colors = themes["money"];
// Parse attributes : "a, b, c" -> ["a", "b", "c"]
function parseAttr(elem, attr) {
	var val = elem.getAttribute(attr);

	return val ? val.replace(/, +/g, " ").split(/ +/g) : null;
}

function parseSet(str) {
	var set, i, j;

	set = str.match(/[-\d\.]+/g);
	for (i = 0; i < set.length; i++) {
		set[i] = +set[i];
	}

	return set.length > 0 ? set : null;
}

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

 function getYForValue(val) {
    var h = height;

    return h - (h * ((val - range[0]) / (range[1] - range[0])));
}


// Initiation functions
function init(elem) {
	type = parseAttr(elem, "data-type")[0];
	set = parseSet(elem.getAttribute("data-set"));
	range = parseAttr(elem, "data-range") || getRange(set);
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
	console.log("height: " + height);
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

    update: function(elem, set) {
    	if (typeof elem === "string") {
    		elem = document.getElementById(elem);
    	}

    	console.log(set);
    	elem.setAttribute("data-set", set);
    	this.render([elem]);
    }
};

win.Jcharts = Jcharts;

})(window);
