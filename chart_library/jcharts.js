/*
	Jcharts
	Seoul National University
*/
(function (win) {
	/*
		Shared data
	*/
	var data, dataMaxLen;

	data = {
		"line" : [],
		"bar" : [],
		"pie" : []
	};
	dataMaxLen = 20;
   
	/*
		Graph part
	*/
	var Jcharts, ctx, type, range, width, height, renderers, offset, maxChartElem;

	range = {
		"line" : [-50, 50],
		"bar" : [-50, 50],
		"pie" : [0, 100]
	}
	renderers = {
		"line" : renderLineChart,
		"bar" : renderBarChart,
		"pie" : renderPieChart
	};
	offset = 50;
	maxChartElem = 20;

	// Parsing functions
	function parseAttr(elem, attr) {
		var val = elem.getAttribute(attr);

		return val ? val.replace(/, +/g, " ").split(/ +/g) : null;
	}
	
	// Drawing line chart functions
	function getXInterval(elem_number) {
		return (width - 2 * offset) / elem_number;
	}

	// return ith x coordinate
	function getXForIndex(idx, elem_number) {
		return offset + idx * getXInterval(elem_number);
	}

	// return y coordinate for input value
	function getYForValue(val, range) {
		var h = height - 2 * offset;

		return h - (h * ((val - range[0]) / (range[1] - range[0]))) + offset;
	}

	// draw axis function
	function drawAxis(vals, range) {
		var i, val, h;

		for (i = 0; i < vals.length; i++) {
			val = vals[i];
			if (val < range[0] || val > range[1]) {
				continue;
			}
			h = getYForValue(val, range);

			ctx.font = "20px Consolas";
			ctx.fillText(val, 10, h + 5);
			drawDotLine(offset, width - offset, h);
		}
	}

	// draw dot line from start_x to end_x
	function drawDotLine(start_x, end_x, y){
		var i, len;

		len = parseInt((end_x - start_x) / 5);

		ctx.strokeStyle = "#bbb";

		for(i = 0; i < len + 1; i++){
			if(i%2 == 0){
				ctx.moveTo(start_x + i*5, y);
				ctx.lineTo(start_x + (i+1)*5, y);
			}
		}

		ctx.stroke();
	}

	function drawAxisForLine() {

	}

	function drawAxisForBar() {

	}
	
	// sum up all set values
	function sumSet(set) {
		var i, n = 0;

		for (i = 0; i < set.length; i++) {
			n += set[i];
		}
	
		return n;
	}
 
	// set graph color type optionally
	function setColorType(grad, section, color){
		var i, len, gradient;
		
		if(grad){
			len = section.length;
			gradient = ctx.createLinearGradient(0,0,0,height);
			
			for(i=0; i<len; i++){
				gradient.addColorStop(section[i], color[i]);
			}
			
			ctx.strokeStyle = gradient;
			ctx.fillStyle = gradient;
		}
		else{
			ctx.strokeStyle = color[0];
			ctx.fillStyle = color[0];
		}
	}

	// Render pie chart function
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
    // convert out of range values to max or min values
	function setMinMax(set, range) {
		var i;
/*
		switch(type){
			case "line" :
				range = range.line;
				break;
			case "bar" :
				range = range.bar;
				break;
			case "pie" :
				range = range.pie;
				break;
		}
*/
		for (i = 0; i < set.length; i++) {
			if (set[i] < range[0]) set[i] = range[0];
			else if (set[i] > range[1]) set[i] = range[1];
		}
	}

	// render line chart function 
	function renderLineChart(set) {
		var i, x, y, len, gradient;

		setMinMax(set, range.line);
		drawAxis([-50, -25, 0, 25, 50], range.line);

		len = set.length;

		ctx.lineWidth = 3;
		ctx.lineJoin = "round";
		setColorType(true, [0,0.5,1],["green",'rgb(100,0,0)','rgb(0,0,100)']); 
		ctx.beginPath();
		
		for (i = 0; i < len; i++){
			w = 1;
			x = len < maxChartElem ? getXForIndex((i + maxChartElem - len), maxChartElem) : getXForIndex(i, maxChartElem);
			y = getYForValue(set[i], range.line);
			h = y - getYForValue(0, range.line);
            if(i==0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }

        ctx.stroke();

	}

	// render bar chart function
	function renderBarChart(set) {
	    var i, a, x, y, w, h, len;

		setMinMax(set, range.bar);
	    drawAxis([-50, -25, 0, 25, 50], range.bar);

	    ctx.lineWidth = 10;
	    ctx.lineJoin = "miter";
	    setColorType(true, [0,1],["green",'rgb(0,0,100)']); 

	    len = set.length;

	    for (i = 0; i < set.length; i++) {
	        w = 1;
            x = len < maxChartElem ? getXForIndex((i + maxChartElem - len), maxChartElem) : getXForIndex(i, maxChartElem);
	        y = getYForValue(set[i], range.bar);
	        h = y - getYForValue(0, range.bar);

	        //ctx.fillStyle = "#FF0000";
	        ctx.fillRect(x, y - h, w*(getXInterval(maxChartElem)-2), h);
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
			//setMinMax(data[type], type);
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
