// MAIN

// standard global variables
var container, scene, camera, renderer, controls, stats;
//var keyboard = new THREEx.KeyboardState();

// custom global variables
var video, videoImage, videoImageContext, videoTexture;

var facialPoints = [];

navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
window.URL = window.URL || window.webkitURL;

var camvideo = document.getElementById('monitor');

	if (!navigator.getUserMedia)
	{
		document.getElementById('errorMessage').innerHTML =
			'Sorry. <code>navigator.getUserMedia()</code> is not available.';
	} else {
		navigator.getUserMedia({video: true}, gotStream, noStream);
	}

function gotStream(stream)
{
	if (window.URL)
	{   //camvideo.src = window.URL.createObjectURL(stream);
      camvideo.srcObject = stream;
  }
	else // Opera
	{   camvideo.src = stream;   }

	camvideo.onerror = function(e)
	{   stream.stop();   };

	stream.onended = noStream;
}

function noStream(e)
{
	var msg = 'No camera available.';
	if (e.code == 1)
	{   msg = 'User denied access to use camera.';   }
	document.getElementById('errorMessage').textContent = msg;
}
init();
// FUNCTIONS
function init()
{
	// SCENE
	scene = new THREE.Scene();

	// CAMERA
	var SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;
	var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 2000;
	camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR);
	scene.add(camera);
	camera.position.set(0,50,400);
	camera.lookAt(scene.position);

	// RENDERER
	renderer = new THREE.WebGLRenderer( {antialias:true} );
	renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
	container = document.getElementById( 'ThreeJS' );
	container.appendChild( renderer.domElement );

	///////////z
	// VIDEO //
	///////////

	video = document.getElementById( 'monitor' );

	videoImage = document.getElementById( 'videoImage' );
	videoImageContext = videoImage.getContext( '2d' );
	// background color if no video present
	videoImageContext.fillStyle = '#000000';
	videoImageContext.fillRect( 0, 0, videoImage.width, videoImage.height );

	videoTexture = new THREE.Texture( videoImage );
	videoTexture.minFilter = THREE.LinearFilter;
	videoTexture.magFilter = THREE.LinearFilter;

	var movieMaterial = new THREE.MeshBasicMaterial( { map: videoTexture, overdraw: true, side:THREE.DoubleSide } );
	// the geometry on which the movie will be displayed;
	// 		movie image will be scaled to fit these dimensions.
	var movieGeometry = new THREE.PlaneGeometry( 100, 100, 1, 1 );
	var movieScreen = new THREE.Mesh( movieGeometry, movieMaterial );
	movieScreen.position.set(0,50,0);
	scene.add(movieScreen);

	camera.position.set(0,50,150);
	camera.lookAt(movieScreen.position);

	var light = new THREE.AmbientLight( 0x404040 ); // soft white light
	scene.add( light );

	animate();

}

function animate()
{
  requestAnimationFrame( animate );
	render();
	//update();
}

/*function update()
{
	controls.update();
	stats.update();
}*/

function render()
{
	if ( video.readyState === video.HAVE_ENOUGH_DATA )
	{
		videoImageContext.drawImage( video, 0, 0, videoImage.width, videoImage.height );
		if ( videoTexture )
			videoTexture.needsUpdate = true;
	}

	renderer.render( scene, camera );
}
