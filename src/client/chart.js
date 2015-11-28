(function (win) {
	var ctx, type, range, width, height, renderers, offset, maxChartElem;
	var backgroundColors, chartColors, chartGradation, axis, lineShape;
	var colorNum, pieRadius, dataLen;
	var animation, chartAnimationSpeed;


	renderers = {
		"line" : renderLineChart,
		"bar" : renderBarChart,
		"pie" : renderPieChart
	};

	function printAll() {
		console.log("------------------------");
		console.log("ctx: " + ctx);
		console.log("type: " + type);
		console.log("range: " + range);
		console.log("width: " + width);
		console.log("height: " + height);
		console.log("renderers: " + renderers);
		console.log("offset: " + offset);
		console.log("maxChartElem: " + maxChartElem);
		console.log("backgroundColors: " + backgroundColors);
		console.log("chartColors: " + chartColors);
		console.log("chartGradation: " + chartGradation);
		console.log("axis: " + axis);
		console.log("lineShape: " + lineShape);
		console.log("colorNum: " + colorNum);
		console.log("pieRadius: " + pieRadius);
		console.log("------------------------");
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
	function getYForValue(val) {
		var h = height - 2 * offset;

		return h - (h * ((val - range[0]) / (range[1] - range[0]))) + offset;
	}

	// draw axis function
	function drawAxis(vals) {
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
		
		ctx.fillText("-20s", 50, height-20); 
		ctx.fillText("-10s", 0.5*width-55, height-20);
		ctx.fillText("now", width-95, height-20);
	}

	// draw dot line from start_x to end_x
	function drawDotLine(startX, endX, y){
		var i, len;

		len = parseInt((endX - startX) / 5);

		ctx.strokeStyle = "#bbb";

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
		for (var i = 0; i < dataLen; i++) {
			if (data[i] < range[0]) data[i] = range[0];
			else if (data[i] > range[1]) data[i] = range[1];
		}
	}

  function setGradColor(color){
		var splitParen, splitComma, gradColor, r, g, b, a;
		
		splitParen = color.split("(");
		splitParen = splitParen[1].split(")");
		splitComma = splitParen[0].split(",");

		r = parseInt(splitComma[0])/8;
		g = parseInt(splitComma[1])/8;
		b = parseInt(splitComma[2])/8;
		a = parseInt(splitComma[3]);

	  gradColor = "rgba(" + Math.trunc(r) + "," + Math.trunc(g) + "," + Math.trunc(b) + "," + a + ")";
  
		return gradColor;
	}

	// set graph color type optionally
	function setColorType(grad, color){
		var i, gradient;
	
		if(grad){			
			if(isHex(color)) color = HexToRGB(color);
			
			if(type == "pie") gradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, pieRadius);
			else gradient = ctx.createLinearGradient(0,0,0,height);
			
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
		ctx.fillRect(0,0,width,height);		
	}

	// Render pie chart function
	function renderPieChart() {
		var i, centerX, centerY, a1, a2, sum;
	
		var tmp_set = [20, 40, 60]; // 3 part of data
		
		setBackground(backgroundGradation, getColor("background",0));

		centerX = width / 2;
		centerY = height / 2;
		
		a1 = 1.5 * Math.PI;
		a2 = 0;
		
		sum = sumSet(tmp_set);

		for (i = 0; i < tmp_set.length; i++) {
			ctx.beginPath();
			
			a2 = a1 + (tmp_set[i] / sum) * (2 * Math.PI);
			ctx.arc(centerX, centerY, pieRadius, a1, a2, false);
			ctx.lineTo(centerX, centerY);

			setColorType(chartGradation, getColor("chart", (i % colorNum)));
			
			ctx.fill();
			ctx.stroke();
			a1 = a2;
		}
		ctx.stroke();
	}

  // render line chart function 
	function renderLineChart() {
		var i, x, y, gradient, cx, cy, prevX, prevY;
		var animationPoints, lineAnimationSpeed = 100;
		
		setBackground(backgroundGradation, getColor("background",0));
		setMinMax();
		drawAxis(axis);
		
		setLineStyle(3, "round");

		for(i = 0; i < dataLen; i++){
		
			setColorType(chartGradation, getColor("chart", i%colorNum));
			
			if(dataLen < maxChartElem) 	x = getXForIndex((i + maxChartElem - dataLen), maxChartElem);
			else	x = getXForIndex(i, maxChartElem);
			
			x += 0.5*getXInterval(maxChartElem);
			y = getYForValue(data[i]);
		
			if(i > 0){
				if(i == 1) cy = y;
				
				ctx.beginPath();
				ctx.moveTo(prevX, prevY);
				if(i == dataLen -1 && animation){
					lineAnimationCnt = 1;
					animationPoints = calcWayPoints(prevX, prevY, x, y);
					animateLine(ctx);
				}
				else{
					if(lineShape == "smooth") cy = renderSmoothLine(cx, cy, x, y);
					else ctx.lineTo(x, y);
				}
			  ctx.stroke();
			
				drawCirclePoint(prevX, prevY);
			}
	
			prevX = x;
			prevY = y;
		}

		function animateLine(ctx) {
			
			ctx.beginPath();
			ctx.moveTo(animationPoints[lineAnimationCnt-1].x, animationPoints[lineAnimationCnt-1].y);
			ctx.lineTo(animationPoints[lineAnimationCnt].x, animationPoints[lineAnimationCnt].y);
			ctx.stroke();

			if (lineAnimationCnt < 10) {
				lineAnimationCnt++;
				setTimeout(function() {
					animateLine(ctx);
				}, lineAnimationSpeed);
			}
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
		cx = x - 0.5*getXInterval(maxChartElem);
		ctx.bezierCurveTo(cx, cy, cx, y, x, y);

		return y;
	}

	// render bar chart function
	function renderBarChart() {
		var i, a, x, y, w, h, barAnimationCnt = 0;

		setBackground(backgroundGradation, getColor("background", 0));
		setMinMax();
		drawAxis(axis);

		for (i = 0; i < dataLen; i++){
			w = 1;

			if(dataLen < maxChartElem) x = getXForIndex((i + maxChartElem - dataLen), maxChartElem);
			else x = getXForIndex(i, maxChartElem);

			y = getYForValue(data[i]);
			h = y - getYForValue(0);
			
			setColorType(chartGradation, getColor("chart", (i % colorNum))); 
		
			if(i == dataLen-1 && animation) animateBar(x, y, h, ctx, barAnimationCnt);	
		  else ctx.fillRect(x, y - h, w*(getXInterval(maxChartElem)-8), h);
	  }
	}

	function animateBar(x, y, h, ctx, cnt){
    var w = 1;
		var renderedH = h * cnt / 10;

		ctx.fillRect(x, y - h, w*(getXInterval(maxChartElem) - 8), renderedH);

		if(cnt < 10){
			cnt++;
			setTimeout(function() { 
				animateBar(x, y, h, ctx, cnt);
			}, 50);
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

		if( a == "chart" ) colorType = chartColors;
		else if( a == "background" ) colorType = backgroundColors;
		
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
			type = obj.type;
			width = obj.width;
			height = obj.height;
			ctx = obj.ctx;
			data = obj.data;
			range = obj.range;
			offset = obj.offset;
			maxChartElem = obj.maxChartElem;
	   	dataLen = data.length;
	    
			backgroundColors = obj.backgroundColors;
			chartColors = obj.chartColors;
			backgroundGradation = obj.backgroundGradation;
			chartGradation  = obj.chartGradation;
			axis = obj.axis;
			lineShape = obj.lineShape;
			pieRadius = obj.pieRadius;    
			animation = obj.animation;
			colorNum = chartColors.length;

			renderers[type](data);
		}
	}
	win.JCLib = JCLib;
})(window);
