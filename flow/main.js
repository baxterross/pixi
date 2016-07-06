(function(window) {

	var figures = [],
		gutterWidth = 20,
		figureHeight,
		figureWidth,
		figureOuterWidth;

	var getDimensions = function() {
		return  {
			height: window.document.body.offsetHeight,
			width: window.document.body.offsetWidth
		};
	};
	var getBounds = function() {
		var bodyWidth = window.document.body.offsetWidth;
		return {
			leftEdge: 0,
			rightEdge: bodyWidth,
			center: 0.5 * bodyWidth
		};
	};
	var setFigureStyles = function(position) {
		var leftEdge = 0,
			rightEdge = window.document.body.offsetWidth,
			center = 0.5 * rightEdge,
			i, globalFigurePosition, positionFactor; // positionFactor of 0 = at edge, 1 = center

		for (i = 0; i < figures.length; i++) {
			globalFigurePosition = (i * figureOuterWidth) + (0.5 * figureOuterWidth) + position.x;
			positionFactor = 1 - ((globalFigurePosition - center) * (globalFigurePosition - center)) / (center * center);
			if (positionFactor > 1)
				positionFactor = 1;
			if (positionFactor < 0)
				positionFactor = 0;
			figures[i].alpha = positionFactor;
			figures[i].height = figureHeight * positionFactor;
			figures[i].width = figureWidth * positionFactor;
		}
	};

	window.onload = function() {
		var dimensions = getDimensions(),
			renderer = PIXI.autoDetectRenderer(dimensions.width, dimensions.height, {
				transparent: true
			}),
			draggable,
			stage = new PIXI.Container(),
			flowContainer = new PIXI.Container(),
			i, texture, man,
			height, width;

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
			flowContainer.addChild(man);
			figures.push(man);
			figureInitialScale = man.scale.x;
		}

		document.body.appendChild(renderer.view);

		(function animate() {
		    requestAnimationFrame(animate);
		    renderer.render(stage);
		}());

		draggable = new Draggable(flowContainer, {
			movementCallback: setFigureStyles,
			scrollY: false
		});
		draggable.init();
	};

	var Draggable = function(element, options) {
		this.element = element;
		this.options = {
			scrollX: true,
			scrollY: true,
			movementCallback: function(position) {}
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
			this.options.movementCallback({
				x: 0,
				y: 0
			});
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
			clearInterval(this.decayInterval);
		}.bind(this);
		this.onDragEnd = function(event) {
			this.data = null;
			this.dragging = false;
			this.decay(this.velocity);
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
				this.options.movementCallback(this.element.position);
		    }
		}.bind(this);
		this.decay = function(velocity) {
			var factor = 2,
				interval = 10,
				threshold = 0.1,
				decayFactor = 0.9,
				falloff = function(v) {
					return decayFactor * v;
				};
			this.decayInterval = setInterval(function() {
				this.element.position.x += (velocity.x / factor);
				this.element.position.y += (velocity.y / factor);
				this.options.movementCallback(this.element.position);
				if (velocity.x > threshold || velocity.x < -threshold) {
					velocity.x = falloff(velocity.x);
				}
				if (velocity.y > threshold || velocity.y < -threshold) {
					velocity.y = falloff(velocity.y);
				}
				if (velocity.x <= threshold && velocity.x >= -threshold) {
					clearInterval(this.decayInterval); 
				}
			}.bind(this), interval);
		}.bind(this);
	};

}(window));