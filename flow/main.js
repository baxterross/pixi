(function(window) {

	var getDimensions = function() {
		return  {
			height: window.document.body.offsetHeight,
			width: window.document.body.offsetWidth
		};
	};

	window.onload = function() {
		var dimensions = getDimensions(),
		renderer = PIXI.autoDetectRenderer(dimensions.width, dimensions.height, {
			transparent: true
		}),
		stage = new PIXI.Container(),
		flowContainer = new PIXI.Container(),
		i, texture, man,
		gutterWidth = 20,
		height, width;

		stage.addChild(flowContainer);
		attachDragEvents(flowContainer);

		for (i = 0; i < 20; i++) {
			texture = PIXI.Texture.fromImage('man.png'),
			man = new PIXI.Sprite(texture);
			man.height = getDimensions().height - gutterWidth;
			man.width = man.height * 0.31;
			man.anchor.set(0.5);
			man.position.x = (man.width * 0.5) + (man.width * i) + (gutterWidth * i) + gutterWidth;
			man.position.y = (man.height * 0.5) + (gutterWidth * 0.5);
			flowContainer.addChild(man);
		}

		document.body.appendChild(renderer.view);

		(function animate() {
		    requestAnimationFrame(animate);
		    renderer.render(stage);
		}());
		window.flowContainer = flowContainer;
	};

	var onDragStart = function(event) {
		this.startPosition = {
			mouse: {
				global: {
					x: event.data.global.x,
					y: event.data.global.y
				},
				relative: {
					x: event.data.global.x - this.position.x,
					y: event.data.global.y - this.position.y
				}
			},
			element: {
				x: this.position.x,
				y: this.position.y
			}
		};
		this.data = event.data;
	    this.alpha = 0.5;
		this.dragging = true;
	};
	var onDragEnd = function(event) {
		this.data = null;
	    this.alpha = 1;
		this.dragging = false;
	};
	var onDragMove = function(event) {
		if (this.dragging) {
			this.currentPosition = {
				mouse: {
					x: event.data.global.x,
					y: event.data.global.y
				}
			};
			this.movementSinceStart = {
				x: this.currentPosition.mouse.x - this.startPosition.mouse.global.x,
				y: this.currentPosition.mouse.y - this.startPosition.mouse.global.y
			};
			this.position.x = this.startPosition.element.x + this.movementSinceStart.x;
			this.position.y = this.startPosition.element.y + this.movementSinceStart.y;
	    }
	};
	var attachDragEvents = function(element) {
		element.interactive = true;
		element.on('mousedown', onDragStart)
	        .on('touchstart', onDragStart)
	        .on('mouseup', onDragEnd)
	        .on('mouseupoutside', onDragEnd)
	        .on('touchend', onDragEnd)
	        .on('touchendoutside', onDragEnd)
	        .on('mousemove', onDragMove)
	        .on('touchmove', onDragMove);
	};

}(window));