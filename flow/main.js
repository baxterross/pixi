(function(window) {

	var figures = [],
		gutterWidth = 20,
		figureHeight,
		figureWidth,
		figureOuterWidth;

	var tween = function(object, property, stop, increment) {
		increment |= 1;
		object[property] += increment;
		if (object[property] >= stop) {
			object[property] = stop;
		} else {
			tween.call(this, property, stop, increment);
		}
	};
	var getDimensions = function() {
		return  {
			height: window.document.body.offsetHeight,
			width: window.document.body.offsetWidth,
			center: 0.5 * window.document.body.offsetWidth
		};
	};
	// this function changes the position into a value used for the display purposes
	var positionDisplay = function(position) {
		position = Math.pow(position, 4); // increasing the exponent results in a wider plateau
		position = 1 - position; // 1 in the middle, 0 at the edge
		position += 0; // you can raise the value so it doesn't fall off as much at the edge
		if (position > 1)
			position = 1; // value can't exceed 1
		return position;
	};
	var setFigure;

	window.onload = function() {
		var dimensions = getDimensions(),
			renderer = PIXI.autoDetectRenderer(dimensions.width, dimensions.height, {
				transparent: true
			}),
			draggable,
			stage = new PIXI.Container(),
			flowContainer = new PIXI.Container(),
			i, texture, man,
			height, width,
			hover = false,
			mouseover = function() {
				hover = true;
				this.tint = 0xff5500;
			},
			mouseout = function() {
				hover = false;
				this.tint = 0xffffff;
			};

		figureHeight = dimensions.height - gutterWidth,
		figureWidth = figureHeight * 0.31,
		figureOuterWidth = figureWidth + gutterWidth;

		stage.addChild(flowContainer);

		for (i = 0; i < 20; i++) {
			texture = PIXI.Texture.fromImage('man.png'),
			man = new PIXI.Sprite(texture);
			man.height = figureHeight;
			man.width = figureWidth;
			man.anchor.set(0.5);
			man.position.x = (figureWidth * 0.5) + (figureOuterWidth * i) + gutterWidth;
			man.position.y = (figureHeight * 0.5) + (gutterWidth * 0.5);
			man.interactive = true;
			man.mouseover = mouseover.bind(man);
			man.mouseout = mouseout.bind(man);
			flowContainer.addChild(man);
			figures.push(man);
		}

		document.body.appendChild(renderer.view);

		(function animate() {
		    requestAnimationFrame(animate);
		    renderer.render(stage);
		}());

		window.draggable = draggable = new Draggable(flowContainer, {
			scrollY: false,
			movementCallbacks: [
				function(figure, position) {
					figure.alpha = positionDisplay(position)
				},
				function(figure, position) {
					figure.height = figureHeight * positionDisplay(position);
					figure.width = figureWidth * positionDisplay(position);
				}
			]
		});
		draggable.init();

		var mousePosition;
		window.document.body.onmousemove = function(event) {
			var mouseVelocity,
				factor = 30;

			if (mousePosition) {
				mouseVelocity = {
					x: event.x - mousePosition.x,
					y: event.y - mousePosition.y
				};
				draggable.velocity.x -= (mouseVelocity.x / 60);
			}

			mousePosition = {
				x: event.x,
				y: event.y
			};
		};
	};

	var Draggable = function(element, options) {
		this.element = element;
		this.options = {
			scrollX: true,
			scrollY: true,
			movementCallbacks: []
		};
		this.velocity = {
			x: 0,
			y: 0
		};

		var key;
		for (key in options) {
			this.options[key] = options[key];
		}

		this.init = function() {
			this.element.interactive = true;
			this.element.on('mousedown', this.onDragStart)
		        .on('touchstart', this.onDragStart)
		        .on('mouseup', this.onDragEnd)
		        .on('mouseupoutside', this.onDragEnd)
		        .on('touchend', this.onDragEnd)
		        .on('touchendoutside', this.onDragEnd)
		        .on('mousemove', this.onDragMove)
		        .on('touchmove', this.onDragMove);
			this.movementCallback({
				x: 0,
				y: 0
			});
			this.decayInterval = window.setInterval(this.decay, 10);
		}.bind(this);
		this.movementCallback = function(position) {
			var center = getDimensions().center,
				i, j,
				globalFigurePosition,
				relatievFigurePosition,
				positionFactor; // positionFactor of 1 = at edge, 0 = center

			for (i = 0; i < figures.length; i++) {
				globalFigurePosition = (i * figureOuterWidth) + (0.5 * figureOuterWidth) + position.x;
				relativeFigurePosition = Math.abs(globalFigurePosition - center);
				positionFactor = (relativeFigurePosition / center);
				if (positionFactor > 1)
					positionFactor = 1;
				if (positionFactor < 0)
					positionFactor = 0;

				for (j = 0; j < this.options.movementCallbacks.length; j++) {
					this.options.movementCallbacks[j].call(this, figures[i], positionFactor);
				}
			}
		}.bind(this);
		this.onDragStart = function(event) {
			this.start = {
				mouseGlobal: {
					x: event.data.global.x,
					y: event.data.global.y
				},
				element: {
					x: this.element.position.x,
					y: this.element.position.y
				}
			};
			this.data = event.data;
			this.dragging = true;
		}.bind(this);
		this.onDragEnd = function(event) {
			this.data = null;
			this.dragging = false;
		}.bind(this);
		this.onDragMove = function(event) {
			if (this.dragging) {
				var current = {
						mouseGlobal: {
							x: event.data.global.x,
							y: event.data.global.y
						}
					},
					movement = {
						x: current.mouseGlobal.x - this.start.mouseGlobal.x,
						y: current.mouseGlobal.y - this.start.mouseGlobal.y
					};

				if (this.options.scrollX == false)
					movement.x = 0;
				if (this.options.scrollY == false)
					movement.y = 0;

				this.previousPosition = this.element.position;
				this.element.position = {
					x: this.start.element.x + movement.x,
					y: this.start.element.y + movement.y
				};
				this.velocity = {
					x: this.element.position.x - this.previousPosition.x,
					y: this.element.position.y - this.previousPosition.y
				};
				this.movementCallback(this.element.position);
		    }
		}.bind(this);
		this.decay = function() {
			if (this.dragging)
				return;

			var factor = 2,
				threshold = 0.1,
				decayFactor = 0.9,
				velocity = this.velocity,
				falloff = function(v) {
					return decayFactor * v;
				};

			this.element.position.x += (velocity.x / factor);
			this.element.position.y += (velocity.y / factor);
			this.movementCallback(this.element.position);

			velocity.x = falloff(velocity.x);
			velocity.y = falloff(velocity.y);
		}.bind(this);
	};

}(window));