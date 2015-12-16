(function (win) {
	var ctx, renderers, data;

	var chart = {
		type: null,
		width: null,
		height: null,
		marginOffset: null,
		range: null,
		elemNum: 20
	};

	var gradation = {
		background: false,
		chart: true
	};

	var opColor = {
		number: 1,
		background: ["rgb(200, 200, 200)"],
		chart: ["#002b33", "#0080cc", "#0054cc"]
	};

	var colorType = [["#a1be95", "#e2dfa2", "#92aac7", "#ed5752"],
									 ["#4897d8", "#ffdb5c", "#fa6e59", "#f8a055"],
									 ["#2988bc", "#2f498e", "#f4eade", "#ed8c72"],
									 ["#882426", "#cdbea7", "#323030", "#c29545"],
									 ["#262f34", "#f34a4a", "#f1d3bd", "#615049"],
									 ["#a1be95", "#e2dfa2", "#92aac7", "#ed5752"]];

	var opLine = {
		lineShape: "step",
		lineWidth: 3,
		lineJoin: "round",
		lineColor: "grey",
		dotSize: 4,
		dotColor: "white"
	}

	var opShape = {
		line: "smooth",
		radius: 0
	};

	var opAxis = {
		xValues: [],
		xOffset: 20,
		yValues: [],
		yOffset: 40,
		font: "20px Consolas",
		fontColor: "white",
		lineColor: "grey"
	};

	var animation = {
		on: false,
		type: 0,
		step: 20
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
	function getXForIndex(idx) {
		var dataLen = data.length;
		var offset = chart.marginOffset;
		var maxNum = chart.elemNum;
	
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

				ctx.textAlign = "right";
				ctx.textBaseline = "middle";
				ctx.font = opAxis.font;
				ctx.fillStyle = opAxis.fontColor;
				ctx.fillText(val, opAxis.yOffset, h);
				drawDotLine(offset, chart.width - offset, h);
			}
		}
		/*
		ctx.fillText("-20s", 50, height - defaultVars.xAxisOffset); 
		ctx.fillText("-10s", 0.5 * chart.width - 55, height - defaultVars.xAxisOffset);
		ctx.fillText("now", chart.width - 95, height - defaultVars.xAxisOffset);
		*/
	}

	// draw dot line from start_x to end_x
	function drawDotLine(startX, endX, y){
		var len = parseInt((endX - startX) / 5);

		ctx.strokeStyle = opAxis.lineColor;
		ctx.beginPath();

		for(var i = 0; i < len + 1; i++){
			if(i % 2 == 0){
				ctx.moveTo(startX + i * 5, y);
				ctx.lineTo(startX + (i + 1) * 5, y);
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
		var height = chart.height;
		var width = chart.width;
		var centerX = width / 2;
		var centerY = height / 2;

		if(grad){			
			if(isHex(color)) color = HexToRGB(color);
			
			if(chart.type == "pie") {
				gradient = ctx.createRadialGradient(centerX, centerY, 
																						0, centerX, centerY, radius);
			}
			else gradient = ctx.createLinearGradient(0, 0, 0, height);
			
			gradient.addColorStop(0, color);
		 // gradient.addColorStop(1, setGradColor(color));
			gradient.addColorStop(1, 'rgba(50,50,50,1)');
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
		var centerX = chart.width / 2;
		var centerY = chart.height / 2;
		var angleArray = [];

		if (!opShape.radius) {
			calculateRadius();
		}
		setBackground(backgroundGradation, getColor("background",0));
	
		for (var i = 0; i < dataLen; i++) {
			a2 = a1 + (data[i] / sum) * (2 * Math.PI);

			if(animation.on){
				angleArray[i] = { sAngle : a1 , eAngle : a2 };
				if(i == dataLen - 1) animatePie(ctx, angleArray, 0, 0);
			}
			else{
				ctx.beginPath();
				ctx.arc(centerX, centerY, opShape.radius, a1, a2, false);
				ctx.lineTo(centerX, centerY);
		
				setColorType(gradation.chart, getColor("chart", (i % opColor.number)));
				ctx.fill();
				ctx.stroke();
			}
			a1 = a2;
		}
	}
	
	function animatePie(ctx, angleArray, cnt1, cnt2){
		var step = animation.step;
		var centerX = chart.width / 2;
		var centerY = chart.height / 2;
		var sAngle, eAngle;
		
		for(var i = 0; i < cnt1+1; i++){
			sAngle = angleArray[i].sAngle;	
			eAngle = angleArray[i].eAngle;
			if(i == cnt1) eAngle = sAngle + (eAngle - sAngle) * cnt2 / step;
				
			ctx.beginPath();
			ctx.arc(centerX, centerY, opShape.radius, sAngle, eAngle, false);
			ctx.lineTo(centerX, centerY);
		
			setColorType(gradation.chart, getColor("chart", (i % opColor.number)));
			ctx.fill();
			ctx.stroke();
		}

		if (cnt2 < step) {
			cnt2++;
			setTimeout(function() { 
				animatePie(ctx, angleArray, cnt1, cnt2);
			}, 500/step);
		}
		else{
			if(cnt1 < (angleArray.length - 1)){
				cnt1++;
				cnt2 = 0;
				setTimeout(function() {
					animatePie(ctx, angleArray, cnt1, cnt2);
				}, 500/step);
			}
		}
	}	

  // render line chart function 
	function renderLineChart() {
		var dataLen = data.length;
/*    var style = {
      dotSize: opLine.dotSize,
      dotColor: opLine.dotColor,
      lineWidth: opLine.lineWidth,
      lineColor: opLine.lineColor
    };
*/
		var points = [];

		setBackground(backgroundGradation, getColor("background", 0));
		setMinMax();
		drawAxis();

		ctx.lineWidth = opLine.lineWidth;
		ctx.lineJoin = opLine.lineJoin;
		ctx.strokeStyle = opLine.lineColor;

		for (var i = 0; i < dataLen; i++) {	
			var x = getXForIndex(i) + 0.5 * getXInterval();
			var y = getYForValue(data[i]);
			var point = { x: x, y: y };

			points.push(point);
			setColorType(gradation.chart, getColor("chart", i % opColor.number));

			if (i > 0) {
				if (i == 1) cy = y;
				ctx.beginPath();
				ctx.moveTo(prevX, prevY);
				
				if(i == dataLen - 1 && animation.on){
					var animPoints = calcWayPoints(prevX, prevY, x, y);
					animateLine(ctx, opLine, animPoints, animation.step, 0);
				} else if (opLine.lineShape == "smooth") {
					cy = renderSmoothLine(cy, x, y);
				} else {
					ctx.lineTo(x, y);
				}
			  ctx.stroke();
			}
	
			prevX = x;
			prevY = y;
		}

		for (var i = 0; i < dataLen; i++) {
			if (!animation.on || i < dataLen - 1) {
				drawCirclePoint(ctx, opLine, points[i]);
			}
		}
	}

	// A local function
	function animateLine(ctx, style, points, step, cnt) {	
		if (cnt > 0) {
			ctx.lineWidth = style.lineWidth;
			ctx.strokeStyle = style.lineColor;
			ctx.beginPath();
			ctx.moveTo(points[cnt - 1].x, points[cnt - 1].y);
			ctx.lineTo(points[cnt].x, points[cnt].y);
			ctx.stroke();
		}
		drawCirclePoint(ctx, style, points[0]);

		if (cnt < step) {
			cnt++;
			setTimeout(function() {
				animateLine(ctx, style, points, step, cnt);
			}, 500 / step);
		} else {
			drawCirclePoint(ctx, style, points[points.length - 1]);
		}
  }

	// A local function
	function drawCirclePoint(ctx, style, point) {
			ctx.strokeStyle = style.lineColor;
			ctx.fillStyle = style.dotColor;
			ctx.beginPath();
		  ctx.arc(point.x, point.y, style.dotSize, 0 * Math.PI, 2 * Math.PI);
			ctx.stroke();
			ctx.fill();
	}

 	function calcWayPoints(x0, y0, x1, y1) {
		var i, x, y, waypoints = [];
		var dx = x1 - x0;
		var dy = y1 - y0; 
		var step = animation.step;

		for(i = 0; i <= step; i++){
			 x = x0 + dx * i / step;
			 y = y0 + dy * i / step;
			
			 waypoints.push({
				x: x,
				y: y
			});
		}

		return (waypoints);
	}

	function renderSmoothLine(cy, x, y){
		cx = x - 0.5 * getXInterval();
		ctx.bezierCurveTo(cx, cy, cx, y, x, y);

		return y;
	}

	// render bar chart function
	function renderBarChart() {
		var x, y, w, h;
		var dataLen = data.length;
		var step = animation.step;

		setBackground(backgroundGradation, getColor("background", 0));
		setMinMax();
		drawAxis();

		for (i = 0; i < dataLen; i++){
			w = getXInterval() / 2
			x = getXForIndex(i);
			y = getYForValue(data[i]);
			h = y - getYForValue(0);

			setColorType(gradation.chart, getColor("chart", (i % opColor.number))); 

			if (!animation.on) {
				ctx.fillRect(x, y - h, w, h);
			} else if (animation.type == 0) {
        if (i == dataLen - 1) {
          animateBar(ctx, w, x, y, h, step, 0);
        } else {
          ctx.fillRect(x, y - h, w, h);
        }
			} else if (animation.type == 1) {
				animateBar(ctx, w, x, y, h, step, 0);
			}
		}
	}

	function animateBar(ctx, w, x, y, h, step, cnt){
		var renderedH = h * cnt / step;

		ctx.fillRect(x, y - h, w, renderedH);

		if (cnt < step) {
			cnt++;
			setTimeout(function() { 
				animateBar(ctx, w, x, y, h, step, cnt);
			}, 500 / step);
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

			//opLine.shape = obj.lineShape;

			opShape.radius = (obj.pieRadius == 0) ? obj.pieRadius : calculateRadius();

			opColor.chart = colorType[1];
			opColor.number = obj.chartColors.length;
			opColor.background = obj.backgroundColors;

			//gradation.chart = obj.chartGradation;

			while (data.length > chart.elemNum) {
				data.shift();
			}

			renderers[chart.type](data);
		}
	}
	win.JCLib = JCLib;
})(window);
