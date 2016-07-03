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

		flowContainer.interactive = true;
		flowContainer
        // events for drag start
        .on('mousedown', onDragStart)
        .on('touchstart', onDragStart)
        // events for drag end
        .on('mouseup', onDragEnd)
        .on('mouseupoutside', onDragEnd)
        .on('touchend', onDragEnd)
        .on('touchendoutside', onDragEnd)
        // events for drag move
        .on('mousemove', onDragMove)
        .on('touchmove', onDragMove);
		stage.addChild(flowContainer);

		for (i = 0; i < 20; i++) {
			texture = PIXI.Texture.fromImage('man.png'),
			man = new PIXI.Sprite(texture);
			man.height = getDimensions().height - gutterWidth;
			man.width = man.height * 0.31;
			man.anchor.x = man.anchor.y = 0.5;
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
			var newPosition = this.data.getLocalPosition(this.parent);
			this.position.x = newPosition.x;
			this.position.y = newPosition.y;
	    }
	};

	window.addEventListener('keydown', function(event) {
		var increment = 2,
			element = window.flowContainer;

		switch (event.keyCode) {
			case 37: // left
				element.position.x -= increment;
			break;
			case 39: // right
				element.position.x += increment;
			break;
			case 38: // up
				element.position.y -= increment;
			break;
			case 40: // down
				element.position.y += increment;
			break;
			case 188: // "<"
				element.rotation -= 0.1;
			break;
			case 190: // ">"
				element.rotation += 0.1;
			break;
		}
	});

}(window));