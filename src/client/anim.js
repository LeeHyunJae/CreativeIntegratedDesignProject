(function(win) {
	// Targets to draw
	var targets = [];

	// Options received from a user
	var ctx = {};
	var width = {};
	var height = {};
	var delay = {};
	var type = {};
	var dangerous = {};

	// Images to draw
	var imgs = [];

	// Paths of images
	var paths = {
		temp: [],
		heart: [],
		sleep: []
	};

	// Temperature theme 0
	paths.temp[0] = [];
  for (i = 0; i < 9; i++) {
    paths.temp[0][i] = "../../imgs/temp1/img (" + (i + 1) + ").gif";
  }

	// Temperature theme 1
	paths.temp[1] = [];
	for (i = 0; i < 28; i++) {
		paths.temp[1][i] = "../../imgs/temp2/img (" + (i + 1) + ").gif";
	}

	// Heart theme 1
	paths.heart[1] = [];
	for (i = 0; i <= 23; i++) {
		paths.heart[1][i] = "../../imgs/heart4/img (" + (i + 1) + ").gif";
	}

	// Heart theme 0
	paths.heart[0] = [];
	for (i = 0; i <= 27; i++) {
		paths.heart[0][i] = "../../imgs/heart3/frame_" + i + "_delay-0.03s.gif";
	}

	// Sleep theme 0
  paths.sleep[0] = []; 
  for (i = 0; i < 28; i++) {
    paths.sleep[0][i] = "../../imgs/temp2/img (" + (i + 1) + ").gif";
  }

	// Check if all images are loaded or not
	function isReady(target) {
		if (imgs[0][target].length == paths[target][0].length) {
			if (type[target] == 0) return true;
			else if (!imgs[1][target]) return false;
			else if (imgs[1][target].length == paths[target][1].length) {
				return true;
			} else return false;
		} else return false;
	}

	function loadImage(target, type, cnt) {
		var path = paths[target][type][cnt];
		var img = new Image;

		//console.log(target + " " + type + " " + cnt)

		if (!imgs[type]) imgs[type] = {};
		if (!imgs[type][target]) imgs[type][target] = [];
		else if (cnt >= paths[target][type].length) return;

		img.onload = function(event) {
			imgs[type][target].push(img);
			loadImage(target, type, cnt + 1);
		}
		img.src = path;
	}

	function animate(target, num) {
		var d = delay[target];

		if (isReady(target)) {
			ctx[target].clearRect(0, 0, width[target], height[target]);

			if (type[target] == 0) {
				ctx[target].drawImage(imgs[0][target][num], 0, 0, width[target], height[target]);
				num = (num + 1) % imgs[0][target].length;

				if (dangerous[target] == 'low') d *= 2;
				if (dangerous[target] == 'high') d /= 2.5;
			} else {
				var idx = 0;
				var n;

				if (dangerous[target] == 'low' || dangerous[target] == 'high') {
					idx = 1;
				}
				n = num % imgs[idx][target].length;
				ctx[target].drawImage(imgs[idx][target][n], 0, 0, width[target], height[target]);
				num = (num + 1) % imgs[idx][target].length;
			}
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
			delay[target] = (obj.animationDelay) ? obj.animationDelay : 30;
			type[target] = (obj.animationType) ? obj.animationType : 0;
			dangerous[target] = false;

			loadImage(target, 0, 0);
			if (type[target] == 1) loadImage(target, 1, 0);
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
