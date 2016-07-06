(function(window) {

	var getDimensions = function() {
		return  {
			height: window.document.body.offsetHeight,
			width: window.document.body.offsetWidth
		};
	};

	var figures = [],
		gutterWidth = 20,
		figureHeight,
		figureWidth,
		figureOuterWidth;

	window.onload = function() {
		var dimensions = getDimensions(),
			renderer = PIXI.autoDetectRenderer(dimensions.width, dimensions.height, {
				transparent: true
			}),
			stage = new PIXI.Container(),
			flowContainer = new PIXI.Container(),
			i, texture, man,
			height, width;

		figureHeight = dimensions.height - gutterWidth,
		figureWidth = figureHeight * 0.31,
		figureOuterWidth = figureWidth + gutterWidth;

		stage.addChild(flowContainer);
		attachDragEvents(flowContainer);

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
		window.flowContainer = flowContainer;
	};

	var setFigureStyles = function(xPosition) {
		var leftEdge = 0,
			rightEdge = window.document.body.offsetWidth,
			center = 0.5 * rightEdge,
			i, globalFigurePosition, positionFactor; // scalingFactor of 0 = at edge, 1 = center
		for (i = 0; i < figures.length; i++) {
			globalFigurePosition = (i * figureOuterWidth) + (0.5 * figureOuterWidth) + xPosition;
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
		this.dragging = true;
	};
	var onDragEnd = function(event) {
		this.data = null;
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
			setFigureStyles(this.position.x);
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