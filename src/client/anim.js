(function(win) {
	var	targets, ctx, width, height, paths, imgs;

	targets = [];
	ctx = {};
	width = {};
	height = {};
	paths = {};
	imgs = {};

	delay = {
		temp: 50,
		heart: 100,
		sleep: 1000
	}

	paths = {
		temp: [
			"http://www.livescience.com/images/i/000/061/056/original/great-white.jpg?1389213661",
			"http://snowbrains.com/wp-content/uploads/2015/01/great-white-up-close_6455_600x450.jpg"
		],
		heart: [
			"https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Heart_corazón.svg/2000px-Heart_corazón.svg.png",
			"http://kids.nationalgeographic.com/content/dam/kids/photos/articles/Science/H-P/heart.jpg"
		],
		sleep: [
		]
	}

	function isExist(target) {
		return ctx[target] ? true : false;
	}

	function isReady(target) {
		return imgs[target].length == paths[target].length ? true : false;
	}

	function loadImages(target) {
		imgs[target] = [];

		paths[target].forEach(function(path) {
			var img = new Image;
			img.onload = function() {
				imgs[target].push(img);
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

	function animate(times, nums) {
		var offset = 100;
	
		for (target in times) {
			if (isReady(target) && times[target] > delay[target]) {
				ctx[target].clearRect(0, 0, width[target], height[target]);
				ctx[target].drawImage(imgs[target][nums[target]], 0, 0, width[target], height[target]);
				times[target] -= delay[target];
				nums[target] = (nums[target] + 1) % imgs[target].length;
			}
			times[target] += offset;
		}

		win.setTimeout(function() {
			animate(times, nums);
		}, offset);
	}

	var JCAnim = {
		setup: function(obj) {
			var target = obj.target;

			targets.push(target);
			ctx[target] = obj.ctx;
			width[target] = obj.width;
			height[target] = obj.height;

			loadImages(target);
		},
		draw: function() {
			var times = {};
			var nums = {};

			for (i in targets) {
				times[targets[i]] = 0;
				nums[targets[i]] = 0;
			}

			animate(times, nums);	
		}
	}

	win.JCAnim = JCAnim;
})(window);
