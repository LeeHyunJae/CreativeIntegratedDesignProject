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
	dangerous = {};

	// Images to draw
	imgs = {};

	// Paths of images
	paths = {
		temp: [],
		heart: [],
		sleep: []
	};

	// Temperature theme 0
	paths.temp[0] = [];
  paths.temp[0] = [];
  for (i = 0; i <= 27; i++) {
    paths.temp[0][i] = "../../imgs/heart3/frame_" + i + "_delay-0.03s.gif";
  }
	

	// Temperature theme 1

	// Heart theme 0
	paths.heart[0] = [];
	for (i = 0; i <= 23; i++) {
		paths.heart[0][i] = "../../imgs/heart4/img (" + (i + 1) + ").gif";
	}

	// Heart theme 1
	paths.heart[1] = [];
	for (i = 0; i <= 27; i++) {
		paths.heart[1][i] = "../../imgs/heart3/frame_" + i + "_delay-0.03s.gif";
	}

  paths.heart[2] = [];
  for (i = 0; i <= 31; i++) {
    paths.heart[2][i] = "../../imgs/heart5/img (" + (i + 1) + ").gif";
  }


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

	function loadImage(target, cnt) {
		var path = paths[target][theme[target]][cnt];
		var img = new Image;

		if (!imgs[target]) imgs[target] = [];
		else if (cnt >= paths[target][theme[target]].length) return;

		img.onload = function(event) {
			imgs[target].push(img);
			loadImage(target, cnt + 1);
		}
		img.src = path;
	}

	function animate(target, num) {
		var d = delay[target];

		if (isReady(target)) {
			ctx[target].clearRect(0, 0, width[target], height[target]);
			ctx[target].drawImage(imgs[target][num], 0, 0, width[target], height[target]);
			num = (num + 1) % imgs[target].length;
		}

		if (dangerous[target] == 'low' || dangerous[target] == 'high') {
			ctx[target].save();
			ctx[target].globalAlpha = 0.5;

			if (dangerous[target] == 'low') {
				d *= 2;
				ctx[target].fillStyle = 'blue';
			} else if (dangerous[target] == 'high') {
				d /= 2;
				ctx[target].fillStyle = 'red';
			}
			ctx[target].fillRect(0, 0, width[target], height[target]);
			ctx[target].restore();
		}

		win.setTimeout(function() {
			animate(target, num);
		}, d);
	}

	// API
	var JCAnim = {
		setup: function(obj) {
			var target = obj.target;

			targets.push(target);
			ctx[target] = obj.ctx;
			width[target] = obj.width;
			height[target] = obj.height;
			delay[target] = (obj.animationDelay) ? animationDelay : 30;
			theme[target] = (obj.animationType) ? animationType : 2;
			dangerous[target] = false;

			loadImage(target, 0);
		},
		
		setDangerous: function(target, isDng) {
			dangerous[target] = isDng;
		},
		
		draw: function() {
			for (i in targets) {
				animate(targets[i], 0);
			}
		}
	}

	win.JCAnim = JCAnim;
})(window);
