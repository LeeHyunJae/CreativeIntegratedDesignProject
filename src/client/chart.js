(function (win) {
	var ctx, renderers, data, width, height;
	var opChart, opBackground, opLine, opAnimation, opPie;
	var opXAxis, opYAxis;
	var colorType = [
		["#7DA3A1", "#B7B8B6", "#34675C", "#B3C100"]
	]
	var dangerColor = 'red';

	var div = 1.1;
	var opLabelTable = {
		on : true,
		posX : 830,
		posY : 100,
		width : 130,
		height : 300,
		font : "20px Consolas",
		fontColor : "black",
		lineColor : "grey",
		color : "rgba(200,200,200)"
	} 
	var renderers = {
		"line" : renderLineChart,
		"bar" : renderBarChart,
		"pie" : renderPieChart
	};

	// Drawing line chart functions
	function getXInterval() {
		return (width - 2 * opChart.offset) / opChart.elemNum;
	}

	// return ith x coordinate
	function getXForIndex(idx, len) {
		var offset = opChart.offset;
		var maxNum = opChart.elemNum;

		if (len < maxNum) {
			return offset + (idx + 0.5 + maxNum - len) * getXInterval();
		} else {
			return offset + (idx + 0.5) * getXInterval();
		}
	}

	// return y coordinate for input value
	function getYForValue(val) {
		var offset = opChart.offset;
		var h = height - 2 * offset;
		var min = opChart.range[0];
		var max = opChart.range[1];

		return h - (h * ((val - min) / (max - min))) + offset;
	}

	function drawAxes() {
    if (opXAxis.on) drawXAxis();
    if (opYAxis.on) drawYAxis();
	}

	// draw axis function
	function drawYAxis() {
		var offset = opChart.offset;
		var vals = opYAxis.values;

		for (i = 0; i < vals.length; i++) {
			var val = vals[i];
			var min = opChart.range[0];
			var max = opChart.range[1];

			if (val >= min && val <= max) {
				var h = getYForValue(val);

				ctx.textAlign = "right";
				ctx.textBaseline = "middle";
				ctx.font = opYAxis.fontType;
				ctx.fillStyle = opYAxis.fontColor;
				ctx.fillText(val, opYAxis.offset, h);

				ctx.lineWidth = opYAxis.lineWidth;
				ctx.strokeStyle = opYAxis.lineColor;
				ctx.lineCap = "round"

				if (opYAxis.lineType == "dot") {
					drawDotLine(offset, width - offset, h);
				} else {
					ctx.beginPath();
					ctx.moveTo(offset, h);
					ctx.lineTo(width - offset, h);
					ctx.stroke();
				}
			}
		}
	}

	function drawXAxis() {
		var labels = opXAxis.labels;
		var length = labels.length;
		var chartOffset = opChart.offset;
		var axisOffset = opXAxis.offset;

		ctx.textAlign = "center";
		ctx.textBaseline = "bottom";
		ctx.font = opXAxis.fontType;
		ctx.fillStyle = opXAxis.fontColor;

		for (var i = 0; i < length; i++) {
			var idx = chartOffset + (width - 2 * chartOffset) * (i + 0.5) / length;
			ctx.fillText(labels[i], idx, height - axisOffset);
		}
	}

	// draw dot line from start_x to end_x
	function drawDotLine(startX, endX, y){
		var len = parseInt((endX - startX) / 5);

		ctx.beginPath();

		for (var i = 0; i < len + 1; i++){
			if (i % 2 == 0){
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
		var min = opChart.range[0];
		var max = opChart.range[1];

		for (var i = 0; i < dataLen; i++) {
			if (data[i] < min) data[i] = min;
			else if (data[i] > max) data[i] = max;
		}
	}

	function drawDanger() {
		ctx.save();
		ctx.fillStyle = dangerColor;
		ctx.globalAlpha = 0.5;
		ctx.fillRect(0, 0, width, height);
		ctx.restore();
	}

  function setGradColor(color){
		var splitByParen, splitByComma, gradColor, r, g, b, a;
		
		splitByParen = color.split("(");
		splitByParen = splitByParen[1].split(")");
		splitByComma = splitByParen[0].split(",");

		r = parseInt(splitByComma[0])/div;
		g = parseInt(splitByComma[1])/div;
		b = parseInt(splitByComma[2])/div;
		a = parseInt(splitByComma[3]);

	  gradColor = "rgba(" + Math.trunc(r) + "," + Math.trunc(g) + "," + Math.trunc(b) + "," + a + ")";
  
		return gradColor;
	}

	// set graph color type optionally
	function setColorType(ctx, grad, color){
		var gradient;
		var radius = opPie.radius;
		var centerX = width / 2;
		var centerY = height / 2;

		if (grad) {			
			if(isHex(color)) color = HexToRGB(color);
			if(type == "pie") {
				gradient = ctx.createRadialGradient(centerX, centerY, 
																						0, centerX, centerY, radius);
			}
			else gradient = ctx.createLinearGradient(0, 0, 0, height);
		
			gradient.addColorStop(0, color);
		 	gradient.addColorStop(1, setGradColor(color));
			ctx.strokeStyle = gradient;
			ctx.fillStyle = gradient;
		} else {
			ctx.strokeStyle = color;
			ctx.fillStyle = color;
		}
	}

	function setBackground(grad, color) {
		setColorType(ctx, grad, color);
		ctx.fillRect(0, 0, width, height);		
	}

	function calculateRadius() {
		var offset = opChart.offset;
		var min = (height < width) ? height : width;

		return min / 2 - offset;
	}

	// Render pie chart function
	function renderPieChart() {
		var a1 = (-0.5) * Math.PI;
		var a2 = 0;
		var sum = sumSet(data);	
		var dataLen = data.length;
		var centerX = width / 2;
		var centerY = height / 2;
		var angleArray = [];

		if (!opPie.radius) {
			calculateRadius();
		}
		setBackground(opBackground.gradation, getColor(opChart, "background", 0));
	
		if (opLabelTable.on) drawPieLabelTable(ctx, opPie.labels);

		for (var i = 0; i < dataLen; i++) {
			a2 = a1 + (data[i] / sum) * (2 * Math.PI);
			angleArray[i] = { sAngle : a1 , eAngle : a2 };

			if(opAnimation.on){
				if(i == dataLen - 1) animatePie(ctx, angleArray, opPie.labels, 0, 0);
			}
			else{
				setColorType(ctx, opChart.gradation, getColor("chart", i % opChart.colors.length));
				drawArc(ctx, centerX, centerY, opPie.radius, a1, a2);
				
				if(opPie.labelOn) drawPieLabel(ctx, angleArray, i);
			}
			a1 = a2;
		}
	}

	function drawPieLabelTable(ctx, labels){
		var posX =  opLabelTable.posX;
		var posY =  opLabelTable.posY;
		var labelNum = labels.length;
		var offset = 30;
		var interval;
		var tmpPosX = posX + 10;
		var tmpPosY = posY + 30;;

		interval = (opLabelTable.height - 2 * offset)/ (2* labelNum -1) ;
	
		ctx.fillStyle = opLabelTable.color;
		ctx.fillRect(posX, posY, opLabelTable.width, opLabelTable.height);
		
		for(var i = 0 ; i < labelNum ; i++){
			tmpPosY = posY + 30 + i * 2 * interval ;
			
			ctx.fillStyle = opChart.colors[i];
			ctx.fillRect(tmpPosX, tmpPosY, interval, interval);
	
			ctx.textAlign = "bottom";
			ctx.textAlign = "left";
			ctx.font = opLabelTable.font;
			ctx.fillText(labels[i], tmpPosX + interval + 10, tmpPosY + (interval*2/4));  
		}
	}

	function drawPieLabel(ctx, angleArray, idx){
		var contentNum = angleArray.length;
		var centerX = width/2;
		var centerY = height/2;
		var positionX, positionY, labelAngle, labelRadius;

		labelAngle = (angleArray[idx].sAngle + angleArray[idx].eAngle)/2;
	  labelRadius = opPie.radius + opPie.labels[idx].length*10;
	
		positionX = centerX + labelRadius * Math.cos(labelAngle);
		positionY = centerY + labelRadius * Math.sin(labelAngle);
		
	  ctx.textAlign = "center";
		ctx.font = opLabelTable.font;
		ctx.fillStyle = opLabelTable.fontColor;
		ctx.fillText(opPie.labels[idx], positionX, positionY);
	}

	function drawArc(ctx, x, y, r, a1, a2){
		ctx.beginPath();
		ctx.arc(x, y, r, a1, a2, false);
		ctx.lineTo(x, y);
		ctx.fill();
		ctx.closePath();
	}

	function animatePie(ctx, angleArray, labels, portion, cnt){
		var step = opAnimation.step;
		var centerX = width / 2;
		var centerY = height / 2;
		var sAngle, eAngle;
		var length = angleArray.length;

		for(var i = 0; i <= portion; i++){
			var color = getColor(opChart, "chart", (opChart.colorIdx + i) % opChart.colors.length);

			sAngle = angleArray[i].sAngle;	
			eAngle = angleArray[i].eAngle;
			
			if(i == portion){
				eAngle = sAngle + (eAngle - sAngle) * cnt / step;
			}
			
			if(opPie.labelOn && cnt > 9) drawPieLabel(ctx, angleArray, i);
		
			setColorType(ctx, opChart.gradation, color);
			drawArc(ctx, centerX, centerY, opPie.radius, sAngle, eAngle);
		}

		if (cnt < step) {
			cnt++;
			setTimeout(function() { 
				animatePie(ctx, angleArray, labels, portion, cnt);
			}, 500 / length / step);
		}
		else{
			if(portion < (length - 1)){
				portion++;
				cnt = 0;
				setTimeout(function() {
					animatePie(ctx, angleArray, labels, portion, cnt);
				}, 500 / length / step);
			}
		}
	}	

  // render line chart function 
	function renderLineChart() {
		var dataLen = data.length;
		var points = [];

		if (opChart.danger) {
			setBackground(opBackground.gradation, getColor(opChart, "background", 0));
		} else {
			ctx.fillStyle = 'grey';
			ctx.fillRect(0, 0, width, height);
		}
		setMinMax();
		drawAxes();		

		ctx.lineWidth = opLine.lineWidth;
		ctx.lineJoin = opLine.lineJoin;
		ctx.strokeStyle = opLine.lineColor;

		for (var i = 0; i < dataLen; i++) {	
			var x = getXForIndex(i, dataLen);
			var y = getYForValue(data[i]);
			var point = { x: x, y: y };
			var color = getColor(opChart, "chart", (opChart.colorIdx + i) % opChart.colors.length);

			points.push(point);
			setColorType(ctx, opChart.gradation, color);

			if (i > 0) {
				if (i == 1) cy = y;
				ctx.beginPath();
				ctx.moveTo(prevX, prevY);
				
				if(i == dataLen - 1 && opAnimation.on){
					var animPoints = calcWayPoints(prevX, prevY, x, y);
					animateLine(ctx, opChart, opLine, animPoints, opAnimation.step, 0, i);
				} else if (opLine.lineShape == "smooth") {
					cy = renderSmoothLine(cy, x, y);
				} else {
					ctx.lineTo(x, y);
				}
			  ctx.stroke();
				ctx.closePath();
			}
	
			prevX = x;
			prevY = y;
		}

		for (var i = 0; i < dataLen; i++) {
			if (opLine.dotOn && (!opAnimation.on || i < dataLen - 1)) {
				drawCirclePoint(ctx, opLine, points[i]);
			}
		}

		if (opChart.danger) drawDanger();
	}

	// A local function
	function animateLine(ctx, opChart, style, points, step, cnt, idx) {	
		if (cnt > 0) {
			var color =  getColor(opChart, "chart", (opChart.colorIdx + idx) % opChart.colors.length);

			if (opChart.gradation) {
				var grad = ctx.createLinearGradient(0, 0, 0, height)

				grad.addColorStop(0, color)
				grad.addColorStop(1, setGradColor(color))
				ctx.strokeStyle = grad;
			} else {
				ctx.strokeStyle = color;
			}
			ctx.lineWidth = style.lineWidth;
			ctx.beginPath();
			ctx.moveTo(points[cnt - 1].x, points[cnt - 1].y);
			ctx.lineTo(points[cnt].x, points[cnt].y);
			ctx.stroke();
			ctx.closePath();
		}
	
		if (style.dotOn) {
			drawCirclePoint(ctx, style, points[0]);
		}

		if (cnt < step) {
			cnt++;
			setTimeout(function() {
				animateLine(ctx, opChart, style, points, step, cnt, idx);
			}, 500 / step);
		} else if (style.dotOn) {
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
		var step = opAnimation.step;

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
		var step = opAnimation.step;

		if (opChart.danger) {
			setBackground(opBackground.gradation, getColor(opChart, "background", 0));
    } else {
			ctx.fillStyle = 'grey';
      ctx.fillRect(0, 0, width, height);
    }

		setMinMax();
		drawAxes();

		for (i = 0; i < dataLen; i++){
			var color = getColor(opChart, "chart", (opChart.colorIdx + i) % opChart.colors.length    );
			
			w = getXInterval() / 2
			x = getXForIndex(i, dataLen) - w / 2;
			y = height - opChart.offset;
			h = getYForValue(data[i]) + opChart.offset - height;

			setColorType(ctx, opChart.gradation, color); 

			if (!opAnimation.on) {
				ctx.fillRect(x, y, w, h);
			} else if (opAnimation.type == 0) {
        if (i == dataLen - 1) {
          animateBar(ctx, w, x, y, h, step, 0);
        } else {
          ctx.fillRect(x, y, w, h);
        }
			} else if (opAnimation.type == 1) {
				animateBar(ctx, w, x, y, h, step, 0);
			}
		}

		if (opChart.danger) drawDanger();
	}

	function animateBar(ctx, w, x, y, h, step, cnt){
		var renderedH = h * cnt / step;

		ctx.fillRect(x, y, w, renderedH);

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

	function getColor(opChart, a, nthColor){
		var colorType, color, rgbColor;

		if (a == "chart") colorType = opChart.colors;
		else if (a == "background") colorType = opBackground.colors;
		
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

	function rgbToRgba(color){
		return "rgba(" + color.split("(")[1].split(")")[0] + ", 1)";
	}

	// A local function
	function calculateRange(data) {
		return [ Math.min.apply(null, data), Math.max.apply(null, data) ];
	}

	function getOpt(opt1, opt2) {
		return (opt1) ? JSON.parse(opt1) : opt2;
	}

	function getOptArray(opt1, opt2) {
		if (opt1) {
			return opt1.slice(1, opt1.length - 1).split(",");
		} else {
			return opt2;
		}
	}

	function getOptString(opt1, opt2) {
		return (opt1) ? opt1 : opt2;
	}

	var JCLib = {
		draw: function(obj) {
			ctx = obj.ctx;
			data = obj.data.slice(0);
			type = obj.type;
			width = obj.width;
			height = obj.height;

			opChart = {};
			opChart.elemNum = getOpt(obj.dataLength, data.length);
			opChart.range = getOptArray(obj.dataRange, calculateRange(data));
			opChart.offset = getOpt(obj.chartOffset, 50);
			opChart.colors = getOptArray(obj.chartColors, colorType[1]);
			opChart.gradation = getOpt(obj.chartGradation, true);
			opChart.colorIdx = getOpt(obj.chartColorIdx, 0);
			opChart.danger = getOpt(obj.danger, false);

			opBackground = {};
			opBackground.colors = getOptArray(obj.backgroundColors, ["rgb(200, 200, 200)"]);
			opBackground.gradation = getOpt(obj.backgroundGradation, false);

			var colors = colorType[0];
			opChart.colors = colors.slice(1, colors.length);
			opBackground.colors = [colors[0]];

			opLine = {};
			opLine.lineShape = getOptString(obj.lineShape, "step");
			opLine.lineWidth = getOpt(obj.lineWidth, 10);
			opLine.lineJoin = getOptString(obj.lineJoin, "round");
			opLine.lineColor = getOptString(obj.lineColor, "grey");
			opLine.dotSize = getOpt(obj.dotSize, 4);
			opLine.dotColor = getOptString(obj.dotColor, "white");
			opLine.dotOn = getOpt(obj.dotOn, true);

			opXAxis = {};
			opXAxis.offset = getOpt(obj.xAxisOffset, 20);
			opXAxis.labels = getOptArray(obj.xAxisValues, ["A", "B", "C"]);
			opXAxis.on = (opXAxis.labels.length) ? true : false;
			opXAxis.fontType = getOptString(obj.xAxisFontType, "20px Consolas");
			opXAxis.fontColor = getOptString(obj.xAxisFontColor, "white");

			opYAxis = {};
			opYAxis.offset = getOpt(obj.yAxisOffset, 40);
			opYAxis.values = getOptArray(obj.yAxisValues, [0, 25, 50, 75, 100]);
      opYAxis.on = (opYAxis.values.length) ? true : false;
      opYAxis.fontType = getOptString(obj.yAxisFontType, "20px Consolas");
			opYAxis.fontColor = getOptString(obj.yAxisFontColor, "white");
			opYAxis.lineWidth = getOpt(obj.yAxisLineWidth, 1);
      opYAxis.lineColor = getOptString(obj.yAxisLineColor, "white");
			opYAxis.lineType = getOptString(obj.yAxisLineType, "dot");

			opPie = {};
			opPie.radius = getOpt(obj.pieRadius, calculateRadius());
			opPie.labels = ["low", "mid", "high"];
			opPie.labelOn = true;

			opAnimation = {};
			opAnimation.on = getOpt(obj.animationOn, "true");
			opAnimation.step = getOpt(obj.animationStep, 20);
			opAnimation.delay = getOpt(obj.animationDelay, 25);
			opAnimation.type = getOpt(obj.animationType, 0);

			while (data.length > opChart.elemNum) {
				data.shift();
			}
			renderers[type](data);
		}
	}
	win.JCLib = JCLib;
})(window);
