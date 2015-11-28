(function(win) {
	var	targets;
	var ctx, width, height, delay, theme;
	var paths, imgs;

	// Targets to draw
	targets = [];

	// Options received from a user
	ctx = {};
	width = {};
	height = {};
	delay = {};
	theme = {};

	// Images to draw
	imgs = {};

	// Paths of images
	paths = {
		temp: [],
		heart: [],
		sleep: []
	};

	// Temperature theme 0
	paths.temp.push([
    "http://www.livescience.com/images/i/000/061/056/original/great-white.jpg?1389213661",
    "http://snowbrains.com/wp-content/uploads/2015/01/great-white-up-close_6455_600x450.jpg"
	]);

	// Temperature theme 1
	paths.temp.push([
	]);

	// Heart theme 0
	paths.heart.push([
    "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Heart_corazón.svg/2000px-Heart_corazón.svg.png",
    "http://kids.nationalgeographic.com/content/dam/kids/photos/articles/Science/H-P/heart.jpg"
	]);

	// Heart theme 1
	paths.heart.push([
	]);

	// Sleep theme 0
	paths.sleep.push([
	]);

	// Sleep theme 1
	paths.sleep.push([
	]);

	// Check if all images are loaded or not
	function isReady(target) {
		return imgs[target].length == paths[target][theme[target]].length ? true : false;
	}

	// Load images
	function loadImages(target) {
		imgs[target] = [];

		paths[target][theme[target]].forEach(function(path) {
			var img = new Image;
			img.onload = function() {
				imgs[target].push(img);
			}
			img.src = path;
		});
	}

	// Animate all images	
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

	// API
	var JCAnim = {
		setup: function(obj) {
			var target = obj.target;

			targets.push(target);
			ctx[target] = obj.ctx;
			width[target] = obj.width;
			height[target] = obj.height;
			delay[target] = obj.delay;
			theme[target] = obj.theme;

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
