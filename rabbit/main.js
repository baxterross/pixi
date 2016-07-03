(function(window) {

	var renderer = PIXI.autoDetectRenderer(800, 600, {
			backgroundColor: 0x1099bb
		}),
		// create the root of the scene graph
		stage = new PIXI.Container(),
		// create a texture from an image path
		texture = PIXI.Texture.fromImage('bunny.png'),
		// create a new Sprite using the texture
		bunny = new PIXI.Sprite(texture);

	// center the sprite's anchor point
	bunny.anchor.x = 0.5;
	bunny.anchor.y = 0.5;

	// move the sprite to the center of the screen
	bunny.position.x = 400;
	bunny.position.y = 300;

	stage.addChild(bunny);

	// start animating
	(function animate() {
	    requestAnimationFrame(animate);

	    // render the container
	    renderer.render(stage);
	}());

	window.onload = function() {
		document.body.appendChild(renderer.view);
	};
	window.addEventListener('keydown', function(event) {
		var increment = 2;

		switch (event.keyCode) {
			case 37:
				bunny.position.x -= increment;
			break;
			case 39:
				bunny.position.x += increment;
			break;
			case 38:
				bunny.position.y -= increment;
			break;
			case 40:
				bunny.position.y += increment;
			break;
			case 188:
				bunny.rotation -= 0.1;
			break;
			case 190:
				bunny.rotation += 0.1;
			break;
		}
	});

}(window));