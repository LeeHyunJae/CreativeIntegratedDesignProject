(function (win) {
	var ctx, type, range, width, height, renderers, offset, maxChartElem;

	renderers = {
		"line" : renderLineChart,
		"bar" : renderBarChart,
		"pie" : renderPieChart
	};

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
			ctx.fillStyle="white";
			ctx.fillText(val, 10, h + 5);
			drawDotLine(offset, width - offset, h);
		}
		
		ctx.fillText("-20s", 40, height-20); 
		ctx.fillText("-10s", 0.5*width-55, height-20);
		ctx.fillText("now", width-95, height-20);
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
	
	// sum up all set values
	function sumSet(set) {
		var i, n = 0;

		for (i = 0; i < set.length; i++) {
			n += set[i];
		}
	
		return n;
	}

  // convert out of range values to max or min values
	function setMinMax(set, range) {
		for (var i = 0; i < set.length; i++) {
			if (set[i] < range[0]) set[i] = range[0];
			else if (set[i] > range[1]) set[i] = range[1];
		}
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

	function setBackground(grad, section, color, opacity) {
		//ctx.globalAlpha = opacity;
		setColorType(grad, section, color);
		ctx.fillRect(0,0,width,height);		
	}

	// Render pie chart function
	function renderPieChart() {
		var i, x, y, r, a1, a2, sum;
		var tmp_set = [20, 40, 60, 70];
		var tmp_color = ["#ff8033","#ffb111","#ffc111","#ffd5dd"];

		x = width / 2;
		y = height / 2;
		r = 250;
		a1 = 1.5 * Math.PI;
		a2 = 0;
		sum = sumSet(tmp_set);

		for (i = 0; i < set.length; i++) {
			ctx.beginPath();
			a2 = a1 + (set[i] / sum) * (2 * Math.PI);

			ctx.arc(x, y, r, a1, a2, false);
			ctx.lineTo(x, y);
			ctx.fillStyle = tmp_color[i];
			ctx.fill();
			ctx.stroke();
			a1 = a2;
		}
		ctx.stroke();
	}

  // render line chart function 
	function renderLineChart(set) {
		var i, x, y, len, gradient, cx, cy;
		var shape = "smooth";

		setMinMax(set, range);
		setBackground(true, [0,1], ["#002b33","#0080cc"]);
		//setBackground(true, [0,0.5,1], ["white","#f2f2f2","white"]);
		drawAxis([-50,-25,0,25,50], range);

		len = set.length;

		ctx.lineWidth = 3;
		ctx.lineJoin = "round";
		setColorType(true, [0,1],["#ff8033","#ffd533"]);
		//setColorType(true, [0,0.5,1],["green",'rgb(100,0,0)','rgb(0,0,100)']); 
		ctx.beginPath();

		for(i = 0; i < len; i++){
			x = len < maxChartElem ? getXForIndex((i + maxChartElem - len), maxChartElem) : getXForIndex(i, maxChartElem);
			x += 0.5*getXInterval(maxChartElem);
			y = getYForValue(set[i], range);
			if(shape == "smooth"){
				cx = x - 0.5*getXInterval(maxChartElem);
				if(i==0) ctx.moveTo(x, y);
				else{
					ctx.bezierCurveTo(cx,cy,cx,y,x,y);
				}
				cy = y;
			}
			else{
				if(i==0) ctx.moveTo(x,y);
				else ctx.lineTo(x,y);
			}
		}
		ctx.stroke();
	}

	// render bar chart function
	function renderBarChart(set) {
		var i, a, x, y, w, h, len;

		setMinMax(set, range);
		setBackground(true, [0,1], ["#002b33","#0080cc"]);
		//setBackground(true, [0,0.5,1], ["white","#f2f2f2","white"]);
		drawAxis([0,20,40,60,80,100], range);

		// ctx.lineWidth = 10;
		// ctx.lineJoin = "miter";
		setColorType(true, [0,1],["#ff8033","#ffd533"]); 

		len = set.length;

		for (i = 0; i < set.length; i++) {
			w = 1;
			x = len < maxChartElem ? getXForIndex((i + maxChartElem - len), maxChartElem) : getXForIndex(i, maxChartElem);
			y = getYForValue(set[i], range);
			h = y - getYForValue(0, range);

			//ctx.fillStyle = "#FF0000";
			ctx.fillRect(x, y - h, w*(getXInterval(maxChartElem)-8), h);
		}
	}

	var JCLib = {
		draw: function(obj) {
			type = obj.type;
			width = obj.width;
			height = obj.height;
			ctx = obj.ctx;
			data = obj.data;
			range = obj.range;
			offset = obj.offset;
			maxChartElem = obj.maxChartElem;

			renderers[type](data);
		}
	}

	win.JCLib = JCLib;
})(window);
