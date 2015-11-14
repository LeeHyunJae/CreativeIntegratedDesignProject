(function(win) {
	var	imgNum, ctx, width, height, target, paths, imgs;

	imgNum = 0;
	paths = {
		temp: [
			"http://www.livescience.com/images/i/000/061/056/original/great-white.jpg?1389213661",
			"http://snowbrains.com/wp-content/uploads/2015/01/great-white-up-close_6455_600x450.jpg"
		]
	}

	/*
	win.requestAnimFrame = (function(callback) {
		return win.requestAnimationFrame || win.webkitRequestAnimationFrame
			|| win.mozRequestAnimationFrame || win.oRequestAnimationFrame
			|| win.msRequestAnimationFrame ||
			function(callback) {
				win.setTimeout(callback, 1000);
			};
	})();
	*/

	function loadImages() {
		imgs = [];

		paths[target].forEach(function(path) {
			var img = new Image;
			img.onload = function() {
				imgs.push(img);
				if (imgs.length == paths[target].length) {
					animate();
				}
			}
			img.src = path;
		});
	}
	
  function drawRectangle(x, y, context) {
    context.beginPath();
    context.rect(x, y, 10, 10);
    context.fillStyle = '#8ED6FF';
    context.fill();
    context.lineWidth = 1;
    context.strokeStyle = 'black';
    context.stroke();
  }

	function animate() {
		ctx.clearRect(0, 0, width, height);
		ctx.drawImage(imgs[imgNum], 0, 0, width, height);
		console.log(imgs[imgNum]);
		imgNum = (imgNum + 1) % 2;

		win.setTimeout(function() {
			animate();
		}, 500);
	}

	var JCAnim = {
		draw: function(obj) {
			ctx = obj.ctx;
			width = obj.width;
			height = obj.height;
			target = obj.target;

			loadImages();
		}
	}

	win.JCAnim = JCAnim;
})(window);
