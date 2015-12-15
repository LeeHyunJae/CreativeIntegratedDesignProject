(function (win) {
	var ctx, renderers, data;
	var idxOffset, centerX, centerY;

	var chart = {
		type: null,
		width: null,
		height: null,
		marginOffset: null,
		range: [0, 1],
		elemNum: 20
	}

	var gradation = {
		background: false,
		chart: true
	}

	var opColor = {
		number: 1,
		background: ["rgb(200, 200, 200)"],
		chart: ["#002b33", "#0080cc", "#0054cc"]
	}

	var opShape = {
		line: "smooth",
		radius: null
	}

	var opAxis = {
		xValues: [],
		yValues: [],
		font: "20px Consolas",
		color: "white"
	}

	var animation = {
		on: false,
		type: 0
	}

	var defaultVars = {
		yAxisOffset : 10,
		xAxisOffset : 20,	
		dotLineStyle : "grey",
	};

	var renderers = {
		"line" : renderLineChart,
		"bar" : renderBarChart,
		"pie" : renderPieChart
	};

	// Drawing line chart functions
	function getXInterval() {
		return (chart.width - 2 * chart.marginOffset) / chart.elemNum;
	}

	// return ith x coordinate
	function getXForIndex(idx){
		var dataLen = data.length;
		var offset = chart.marginOffset;
		var maxNum = chart.elemNum
	
		if (dataLen < maxNum) {
			return offset + (idx + maxNum - dataLen) * getXInterval();
		} else {
			return offset + idx * getXInterval();
		}
	}

	// return y coordinate for input value
	function getYForValue(val) {
		var offset = chart.marginOffset;
		var h = chart.height - 2 * offset;
		var min = chart.range[0];
		var max = chart.range[1];

		return h - (h * ((val - min) / (max - min))) + offset;
	}

	// draw axis function
	function drawAxis() {
		var height = chart.height;
		var offset = chart.marginOffset;
		var vals = opAxis.yValues;

		for (i = 0; i < vals.length; i++) {
			var val = vals[i];
			var min = chart.range[0];
			var max = chart.range[1];

			if (val >= min && val <= max) {
				var h = getYForValue(val);

				ctx.font = opAxis.font;
				ctx.fillStyle = opAxis.color;
				ctx.fillText(val, defaultVars.yAxisOffset, h + 5);
				drawDotLine(offset, chart.width - offset, h);
			}
		}	
		ctx.fillText("-20s", 50, height - defaultVars.xAxisOffset); 
		ctx.fillText("-10s", 0.5 * chart.width - 55, height - defaultVars.xAxisOffset);
		ctx.fillText("now", chart.width - 95, height - defaultVars.xAxisOffset);
	}

	// draw dot line from start_x to end_x
	function drawDotLine(startX, endX, y){
		var i, len;

		len = parseInt((endX - startX) / 5);

		ctx.strokeStyle = defaultVars.dotLineStyle;

		ctx.beginPath();
		for(i = 0; i < len + 1; i++){
			if(i%2 == 0){
				ctx.moveTo(startX + i*5, y);
				ctx.lineTo(startX + (i+1)*5, y);
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
	function setMinMax() {
		var dataLen = data.length;
		var min = chart.range[0];
		var max = chart.range[1];

		for (var i = 0; i < dataLen; i++) {
			if (data[i] < min) data[i] = min;
			else if (data[i] > max) data[i] = max;
		}
	}

  function setGradColor(color){
		var splitByParen, splitByComma, gradColor, r, g, b, a;
		
		splitByParen = color.split("(");
		splitByParen = splitByParen[1].split(")");
		splitByComma = splitByParen[0].split(",");

		r = parseInt(splitByComma[0])/8;
		g = parseInt(splitByComma[1])/8;
		b = parseInt(splitByComma[2])/8;
		a = parseInt(splitByComma[3]);

	  gradColor = "rgba(" + Math.trunc(r) + "," + Math.trunc(g) + "," + Math.trunc(b) + "," + a + ")";
  
		return gradColor;
	}

	// set graph color type optionally
	function setColorType(grad, color){
		var gradient;
		var radius = opShape.radius;

		if(grad){			
			if(isHex(color)) color = HexToRGB(color);
			
			if(chart.type == "pie") {
				gradient = ctx.createRadialGradient(centerX, centerY, 
																						0, centerX, centerY, radius);
			}
			else gradient = ctx.createLinearGradient(0, 0, 0, chart.height);
			
			gradient.addColorStop(0, color);
		  gradient.addColorStop(1, setGradColor(color));

			ctx.strokeStyle = gradient;
			ctx.fillStyle = gradient;
		}
		else{
			ctx.strokeStyle = color;
			ctx.fillStyle = color;
		}
	}

	function setBackground(grad, color) {
		setColorType(grad, color);
		ctx.fillRect(0, 0, chart.width, chart.height);		
	}

	function calculateRadius() {
		var height = chart.height;
		var width = chart.width;
		var offset = chart.marginOffset;
		var min = (height < width) ? height : width;

		return min / 2 - offset;
	}

	// Render pie chart function
	function renderPieChart() {
		var a1 = 1.5 * Math.PI;
		var a2 = 0;
		var sum = sumSet(data);	
		var dataLen = data.length;

		if (!opShape.radius) {
			calculateRadius();
		}
		setBackground(backgroundGradation, getColor("background",0));

		for (i = 0; i < dataLen; i++) {
			ctx.beginPath();
			
			a2 = a1 + (data[i] / sum) * (2 * Math.PI);
			ctx.arc(centerX, centerY, opShape.radius, a1, a2, false);
			ctx.lineTo(centerX, centerY);

			setColorType(gradation.chart, getColor("chart", (i % opColor.number)));
			
			ctx.fill();
			ctx.stroke();
			a1 = a2;
		}
		ctx.stroke();
	}

  // render line chart function 
	function renderLineChart() {
		var i, x, y, gradient, cx, cy, prevX, prevY;
		var animationPoints;
		var dataLen = data.length;

		setBackground(backgroundGradation, getColor("background",0));
		setMinMax();
		drawAxis();
		
		setLineStyle(3, "round");

		for(i = idxOffset; i < dataLen; i++){
		
			setColorType(gradation.chart, getColor("chart", i % opColor.number));
			
			x = getXForIndex(i-idxOffset);
			x += 0.5 * getXInterval();
			y = getYForValue(data[i]);
		
			if(i > 0){
				if(i == 1) cy = y;
				
				ctx.beginPath();
				ctx.moveTo(prevX, prevY);
				if(i == dataLen -1 && animation.on){
					animationPoints = calcWayPoints(prevX, prevY, x, y);
					animateLine(ctx, animationPoints, 1 );
				}
				else{
					if(opShape.line == "smooth") cy = renderSmoothLine(cx, cy, x, y);
					else ctx.lineTo(x, y);
				}
			  ctx.stroke();
			
				drawCirclePoint(prevX, prevY);
			}
	
			prevX = x;
			prevY = y;
		}
	}

	function animateLine(ctx, animationPoints, lineAnimationCnt) {
			
			ctx.beginPath();
			ctx.moveTo(animationPoints[lineAnimationCnt-1].x, animationPoints[lineAnimationCnt-1].y);
			ctx.lineTo(animationPoints[lineAnimationCnt].x, animationPoints[lineAnimationCnt].y);
			ctx.stroke();

			if (lineAnimationCnt < 10) {
				lineAnimationCnt++;
				setTimeout(function() {
					animateLine(ctx, animationPoints, lineAnimationCnt);
				}, 100);
			}
  }

	function drawCirclePoint(x, y){
			ctx.beginPath();
		  ctx.arc(x, y, 5, 0*Math.PI, 2*Math.PI);
			ctx.fill();
	}

 	function calcWayPoints(x0, y0, x1, y1) {
		var i, x, y, waypoints = [];
		var dx = x1 - x0;
		var dy = y1 - y0; 
	
		for(i = 0; i <= 10; i++){
			 x = x0 + dx * i / 10;
			 y = y0 + dy * i / 10;
			
			 waypoints.push({
				x: x,
				y: y
			});
		}

		return (waypoints);
	}

	function setLineStyle(w,j){
		ctx.lineWidth = w;
		ctx.lineJoin = j;	
	}

	function renderSmoothLine(cx, cy, x, y){
		cx = x - 0.5 * getXInterval();
		ctx.bezierCurveTo(cx, cy, cx, y, x, y);

		return y;
	}

	// render bar chart function
	function renderBarChart() {
		var x, y, w, h;
		var dataLen = data.length;

		setBackground(backgroundGradation, getColor("background", 0));
		setMinMax();
		drawAxis();

		for (i = idxOffset; i < dataLen; i++){
			w = getXInterval() / 2
			x = getXForIndex(i - idxOffset);
			y = getYForValue(data[i]);
			h = y - getYForValue(0);

			setColorType(gradation.chart, getColor("chart", (i % opColor.number))); 

			if (!animation.on) {
				ctx.fillRect(x, y - h, w, h);
			} else if (animation.type == 0) {
        if (i == dataLen - 1) {
          animateBar(ctx, w, x, y, h, 0);
        } else {
          ctx.fillRect(x, y - h, w, h);
        }
			} else if (animation.type == 1) {
				animateBar(ctx, w, x, y, h, 0);
			}
		}
	}

	function animateBar(ctx, w, x, y, h, cnt){
		var step = 20;
		var renderedH = h * cnt / step;

		ctx.fillRect(x, y - h, w, renderedH);

		if (cnt < step) {
			cnt++;
			setTimeout(function() { 
				animateBar(ctx, w, x, y, h, cnt);
			}, 25);
		}
	}

	function isHex(data_){
		if(data_.charAt(0) == '#') return true;
		else return false;
	}

	function HexToRGB(hexData){
		var c = hexData.match(/\w/g);
		var n;

		if(c.length === 3){
			c = [c[0],c[0],c[1],c[1],c[2],c[2]];
		}

		n = +("0x" + c.join(""));

		return {
			r : (n & 0xFF0000) >> 16,
			g : (n & 0X00FF00) >> 8,
			b : (n & 0X0000FF),
			a : 1
		};
	}

	function getColor(a, nthColor){
		var colorType, color, rgbColor;

		if (a == "chart") colorType = opColor.chart;
		else if (a == "background") colorType = opColor.background;
		
	  color = colorType[nthColor]; 
		
  	if(isHex(color)){
			rgb_color = HexToRGB(color);
			return "rgba("+rgb_color.r+", "+rgb_color.g+", "+rgb_color.b+", "+ rgb_color.a+")";
		}
		else{
			 if(color.split("(")[0].length == 4) return color;
			 else  return "rgba(" + color.split("(")[1].split(")")[0] + ", 1)";
   	}
	}

	var JCLib = {
		draw: function(obj) {
			ctx = obj.ctx;
			data = obj.data;
	    
			backgroundGradation = obj.backgroundGradation;
			animation.on = obj.animation;

			chart.elemNum = obj.maxChartElem;
			chart.range = obj.range;
			chart.type = obj.type;
			chart.width = (obj.width) ? obj.width : 100;
			chart.height = (obj.height) ? obj.height : 100;
			chart.marginOffset = (obj.offset) ? obj.offset : 50;

			opAxis.yValues = obj.axis;

			opShape.line = obj.lineShape;
			opShape.radius = (obj.pieRadius) ? obj.pieRadius : calculateRadius();

			opColor.chart = obj.chartColors;
			opColor.number = obj.chartColors.length;
			opColor.background = obj.backgroundColors;

			gradation.chart = obj.chartGradation;

			if (data.length > chart.elemNum) {
				idxOffset = data.length - chart.elemNum;
			}
			else idxOffset = 0;

			centerX = chart.width / 2;
			centerY = chart.height / 2;

			renderers[chart.type](data);
		}
	}
	win.JCLib = JCLib;
})(window);
