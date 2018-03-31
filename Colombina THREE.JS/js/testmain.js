// MAIN
let asmWorker = new Worker('asm-worker.js');

var video = document.querySelector("#monitor");
// standard global variables
var container, scene, camera, renderer, controls, stats;
var zDistance = 3;
let objType = 'faceDetect';

// custom global variables
var video, videoImage, videoImageContext, videoTexture, positions, facialPoints;
var MAX_POINTS = 68;

let canvases = {};
canvases.running = false;
canvases.ready = false;

canvases.width = 640;
canvases.height = 480;

canvases.dummy = {};
canvases.dummy.canvas = document.getElementById('dummy');
canvases.dummy.context = canvases.dummy.canvas.getContext('2d');
canvases.dummy.canvas.width = canvases.width;
canvases.dummy.canvas.height = canvases.height;

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

	///////////
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
	var movieGeometry = new THREE.PlaneGeometry( 45, 45, 1, 1 );
	var movieScreen = new THREE.Mesh( movieGeometry, movieMaterial );
	movieScreen.position.set(0,50,0);
	scene.add(movieScreen);

	camera.position.set(0,50,150);
	camera.lookAt(movieScreen.position);

	var light = new THREE.AmbientLight( 0x404040 ); // soft white light
	scene.add( light );

	//FACIAL POINTS
	// geometry
	var geometry = new THREE.BufferGeometry();

	// attributes
	var positions = new Float32Array( MAX_POINTS * 3 ); // 3 vertices per point
	geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );

	// drawcalls
	drawCount = 68; // draw the first 2 points, only
	geometry.setDrawRange( 0, drawCount );

	// material
	var material = new THREE.PointsMaterial( { color: 0xff0000 } );

	//points
  facialPoints = new THREE.Points(geometry,material);
	facialPoints.position.set(0,50,0);
	scene.add( facialPoints );

	animate();

}

function animate()
{
  requestAnimationFrame( animate );
	//positions = facialPoints.geometry.attributes.position.array;
	facialPoints.geometry.attributes.position.needsUpdate = true;
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


function updateFacialPoints(facialpoints){
	positions = facialPoints.geometry.attributes.position.array;

	var x,y,z;
	var index = 0;
	for (let i=0; i< MAX_POINTS; i++) {
		let rect = e.data.features[i];

		positions[ index ++ ] = rect.x;
		positions[ index ++ ] = rect.y;
		positions[ index ++ ] = zDistance;
  }
}

asmWorker.onmessage = function (e) {
    if (e.data.msg == 'asm') {
        if (canvases.ready) { setTimeout(detect, 2000)}
        else {
            canvases.ready = true
        }
    }
    else {
        updateFacialPoints(e);
        startWorker(videoImageContext.getImageData(0, 0, videoImage.width, videoImage.height), objType, 'asm')
    }
}
