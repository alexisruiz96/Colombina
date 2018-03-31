let asmWorker = new Worker('asm-worker.js');
let camvideo = document.querySelector("#monitor");

// custom global variables
var video,videoImage, videoImageContext, videoTexture;
// check for getUserMedia support
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia || navigator.oGetUserMedia;
window.URL = window.URL || window.webkitURL;

if (navigator.getUserMedia) {
    // get webcam feed if available
    navigator.getUserMedia({ video: true }, handleVideo, () => console.log('error with webcam'));
    // setTimeout(detect, 8000)
}

document.addEventListener('DOMContentLoaded', function () {
    console.log('dom loaded')
}, false);

//Contains a url that points to the document file
function handleVideo(stream) {
    video.src = window.URL.createObjectURL(stream);
}

let canvases = {};
canvases.running = false;
canvases.ready = false;
canvases.asm = {};

canvases.asm.fps = 0;

canvases.asm.lastTime = +new Date;

canvases.asm.fpsArr = [];

canvases.asm.color = 'rgba(0, 191, 255, 1)';
canvases.width = 320;
canvases.height = 240;
canvases.scale = 2;

canvases.asm.canvas = document.getElementById('asm');
canvases.asm.context = canvases.asm.canvas.getContext('2d');
canvases.asm.canvas.width = canvases.width;
canvases.asm.canvas.height = canvases.height;

canvases.dummy = {};
canvases.dummy.canvas = document.getElementById('dummy');
canvases.dummy.context = canvases.dummy.canvas.getContext('2d');
canvases.dummy.canvas.width = canvases.width;
canvases.dummy.canvas.height = canvases.height;

function detect(type) {
    if (!canvases.running) {
        canvases.running = true;
        startWorker(canvases.asm.context.getImageData(0, 0, canvases.asm.canvas.width, canvases.asm.canvas.height), objType, 'asm');
    }
}

function startWorker(imageData, command, type) {
    canvases.dummy.context.drawImage(asm, 0, 0, imageData.width, imageData.height, 0, 0, Math.round(imageData.width/ canvases.scale), Math.round(imageData.height/canvases.scale));
    let message = {
        cmd: command,
        img: canvases.dummy.context.getImageData(0, 0, Math.round(imageData.width/ canvases.scale), Math.round(imageData.height/canvases.scale))
    };
    asmWorker.postMessage(message);
}

function updateCanvas(e, targetCanvas) {
    targetCanvas.context.drawImage(video, 0, 0, targetCanvas.canvas.width, targetCanvas.canvas.height);
    targetCanvas.context.strokeStyle = targetCanvas.color;
    targetCanvas.context.lineWidth = 2;

    for (let i=0; i< e.data.features.length; i++) {
      let rect = e.data.features[i];
      targetCanvas.context.strokeRect(rect.x*canvases.scale,rect.y*canvases.scale,1,1);
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
        updateCanvas(e, canvases.asm);
        requestAnimationFrame((asmTime) => {
            canvases.asm.startTime = asmTime;
            startWorker(canvases.asm.context.getImageData(0, 0, canvases.asm.canvas.width, canvases.asm.canvas.height), objType, 'asm')
        });
    }
}

window.onerror = function (event) {
    console.log(event)
};

init();
animate();

// FUNCTIONS
function init()
{
	// SCENE
	scene = new THREE.Scene();
	// CAMERA
	var SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;
	var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 20000;
	camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR);
	scene.add(camera);
	camera.position.set(0,150,400);
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
	var movieGeometry = new THREE.PlaneGeometry( 100, 100, 1, 1 );
	var movieScreen = new THREE.Mesh( movieGeometry, movieMaterial );
	movieScreen.position.set(0,50,0);
	scene.add(movieScreen);

	camera.position.set(0,150,300);
	camera.lookAt(movieScreen.position);


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
