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
			this.startPosition = {
				mouse: {
					global: {
						x: event.data.global.x,
						y: event.data.global.y
					},
					relative: {
						x: event.data.global.x - this.element.position.x,
						y: event.data.global.y - this.element.position.y
					}
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
				var currentPosition = {
					mouse: {
						x: event.data.global.x,
						y: event.data.global.y
					}
				},
				movement = {
					x: currentPosition.mouse.x - this.startPosition.mouse.global.x,
					y: currentPosition.mouse.y - this.startPosition.mouse.global.y
				},
				position = {
					x: this.startPosition.element.x + movement.x,
					y: this.startPosition.element.y + movement.y
				};
				if (!this.options.scrollX)
					position.x = 0;
				if (!this.options.scrollY)
					position.y = 0;
				this.element.position.x = position.x;
				this.element.position.y = position.y;
				this.options.movementCallback(position);
		    }
		}.bind(this);
	};

}(window));