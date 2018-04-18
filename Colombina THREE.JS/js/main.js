// MAIN
let asmWorker = new Worker('asm-worker.js');

let video = document.querySelector("#monitor");
// standard global variables
let container, scene, camera, renderer, controls, stats;
const objType = 'faceDetect';

let isPainted,selectedObject;

// custom global variables
let videoImage, videoImageContext, videoTexture, positions, facialPoints, cap, bbox, testPoints;
let ratioPixels = [];
const MAX_POINTS = 68;
let vectorSize = 3;

let canvases = {};
canvases.running = false;
canvases.ready = false;

canvases.width = 640;
canvases.height = 480;
canvases.scale = 2;

canvases.dummy = {};
canvases.dummy.canvas = document.getElementById('dummy');
canvases.dummy.context = canvases.dummy.canvas.getContext('2d');
canvases.dummy.canvas.width = canvases.width;
canvases.dummy.canvas.height = canvases.height;

navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
window.URL = window.URL || window.webkitURL;

let camvideo = document.getElementById('monitor');

config();
init();
update();

function config(){
	if (!navigator.getUserMedia)
	{
		document.getElementById('errorMessage').innerHTML =
			'Sorry. <code>navigator.getUserMedia()</code> is not available.';
	} else {
		navigator.getUserMedia({video: true}, gotStream, noStream);
	}
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
	let msg = 'No camera available.';
	if (e.code === 1)
	{   msg = 'User denied access to use camera.';   }
	document.getElementById('errorMessage').textContent = msg;
}

// FUNCTIONS
function init()
{
	// SCENE
	scene = new THREE.Scene();

	isPainted = false;
	// CAMERA
	const SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;
	const VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 2000;
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

	let movieMaterial = new THREE.MeshBasicMaterial( { map: videoTexture, overdraw: true } );
	// the geometry where the movie will be displayed;
	// 		movie image will be scaled to fit these dimensions.
	let movieGeometry = new THREE.PlaneGeometry( 80, 80, 1, 1 );
	let movieScreen = new THREE.Mesh( movieGeometry, movieMaterial );
	movieScreen.name = "movieScreen";
	movieScreen.position.set(0,0,0);
	scene.add(movieScreen);

	//define ratio of pixels from video to movieScreen
	ratioPixels.x = videoImage.width / movieScreen.geometry.parameters.width;
	ratioPixels.y = videoImage.height / movieScreen.geometry.parameters.height;

	let light = new THREE.AmbientLight( 0x404040 ); // soft white light
	scene.add( light );

	//FACIAL POINTS
	// geometry
	let geometry = new THREE.BufferGeometry();

	// attributes
	let positions = new Float32Array( MAX_POINTS * 3 ); // 3 vertices per point
	geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );

	// drawcalls
	drawCount = 68; // draw the first 2 points, only
	geometry.setDrawRange( 0, drawCount );

	// material
	let material = new THREE.PointsMaterial( { color: 0xff0000 } );

	//points
  facialPoints = new THREE.Points(geometry,material);
	facialPoints.position.set(0,0,0);
	scene.add( facialPoints );

	//TESTING EYES
	// geometry
	let geometryTEST = new THREE.BufferGeometry();
	let max_test = 2;
	// attributes
	let positionsTEST = new Float32Array( max_test * 3 ); // 3 vertices per point
	geometryTEST.addAttribute( 'position', new THREE.BufferAttribute( positionsTEST, 3 ) );

	// material
	let materialTEST = new THREE.PointsMaterial( { color: 0x00ff00 } );

	//points
  testPoints = new THREE.Points(geometryTEST,materialTEST);
	testPoints.position.set(0,0,0);
	scene.add( testPoints );

	ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
	scene.add(ambientLight);

	light = new THREE.PointLight(0xffffff, 0.8, 18);
	light.position.set(-3,6,-3);
	light.castShadow = true;
	light.shadow.camera.near = 0.1;
	light.shadow.camera.far = 25;
	scene.add(light);


	let textureLoader = new THREE.TextureLoader();
	capTexture = textureLoader.load('models/cap/misc16L.jpg');
	capBump = textureLoader.load('models/cap/miscbump.jpg');

	//Load material and obj
	let mtlLoader = new THREE.MTLLoader();
	mtlLoader.load("models/cap/objCap.mtl", function(materials){

		materials.preload();
		let objLoader = new THREE.OBJLoader();
		objLoader.setMaterials(materials);

		objLoader.load("models/cap/objCap.obj", function(mesh){
			mesh.name = "cap";
			mesh.traverse(function(node){
				if( node instanceof THREE.Mesh ){
					node.castShadow = true;
					node.receiveShadow = true;
				}
			});

			scene.add(mesh);
		});

	});

	//bounding box of the selected Mesh
	bbox = new THREE.Box3();

	camera.position.set(0,0,150);
	camera.lookAt(0, 0, 0);

}

function update()
{
  requestAnimationFrame( update );
	//positions = facialPoints.geometry.attributes.position.array;
	facialPoints.geometry.attributes.position.needsUpdate = true;
	testPoints.geometry.attributes.position.needsUpdate = true;
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

asmWorker.onmessage = function (e) {
    if (e.data.msg == 'asm') {
        if (canvases.ready) { setTimeout(detect, 2000)}
        else {
            canvases.ready = true
        }
    }
    else {
			//debugger
      let updatedpoints = updateFacialPoints(e);
			let eyedistance = calculateEyesDistance(updatedpoints, e.data.features.length);
			hideShowPoints(e.data.features.length);
			cap = scene.getObjectByName("cap");
			bbox = bbox.setFromObject(cap);
			scalateObjectToFace(eyedistance, bbox);
      startWorker(videoImageContext.getImageData(0, 0, videoImage.width, videoImage.height), objType, 'asm');

    }
}

function detect(type) {
    if (!canvases.running) {
        canvases.running = true;
        startWorker(videoImageContext.getImageData(0, 0, videoImage.width, videoImage.height), objType, 'asm');
    }
}

function startWorker(imageData, command, type) {
	//update();
  canvases.dummy.context.drawImage(monitor, 0, 0, imageData.width, imageData.height, 0, 0, Math.round(imageData.width/ canvases.scale), Math.round(imageData.height/canvases.scale));
  let message = {
      cmd: command,
      img: canvases.dummy.context.getImageData(0, 0, Math.round(imageData.width/ canvases.scale), Math.round(imageData.height/canvases.scale))
  };
  asmWorker.postMessage(message);
}

function updateFacialPoints(facialpoints){
	positions = facialPoints.geometry.attributes.position.array;
	let x,y,z;
	let index = 0;
	const depth = 3;
	for (let i=0; i< facialpoints.data.features.length; i++) {
		let rect = facialpoints.data.features[i];
		positions[ index ++ ] = ((rect.x * canvases.scale)-videoImage.width/2) / ratioPixels.x;
		positions[ index ++ ] = -(((rect.y * canvases.scale)-videoImage.height/2) / ratioPixels.y);
		positions[ index ++ ] = depth;
  }

	/*index = 0;
	x = positions[index ++];
	y = positions[index ++];
	selectedObject = scene.getObjectByName("cap");
	//calcular bbox cap
	selectedObject.position.set(x,y,0);
	selectedObject.scale.set(4, 4, 4);*/

	return positions;
}

function hideShowPoints(facialPointsLength){
	if(facialPointsLength === 0 && isPainted != false){
		scene.remove(facialPoints);
		scene.remove(testPoints);
		cap.visible = false;
		isPainted = false;
	}
	else if (facialPointsLength != 0 && isPainted != true) {
		scene.add(facialPoints);
		scene.add(testPoints);
		cap.visible = true;
		isPainted = true;
	}
}

function calculateEyesDistance(positions, facialpointssize){

	if(!facialpointssize)
		return;

	let test = 0;
	let eyesDistanceValue, pos;
	let eyePoints = [];
	eyePoints.mineye1 = 37;
	eyePoints.maxeye1 = 42;
	eyePoints.mineye2 = 43;
	eyePoints.maxeye2 = 48;
	eyePoints.sizeeye = (eyePoints.maxeye1 - eyePoints.mineye1) + 1;
	let sumPoints = [];
	sumPoints.xeye1 = sumPoints.yeye1 = sumPoints.xeye2 = sumPoints.yeye2 = 0;
	let indexEye1 = eyePoints.mineye1;
	let indexEye2 = eyePoints.mineye2;
	let centerEyePointsAvg = [];


	for( let i=0; i < eyePoints.sizeeye; i++){
		pos = (indexEye1 - 1) * vectorSize;
		sumPoints.xeye1 = sumPoints.xeye1 + positions[pos];
		sumPoints.yeye1 = sumPoints.yeye1 + positions[pos + 1];
		//console.log("Eye 1 point " +  indexEye1  + ": " +  positions[pos] + "," + positions[pos + 1]);
		indexEye1 ++;
	}


	for( let i=0; i < eyePoints.sizeeye; i++){
		pos = (indexEye2 - 1) * vectorSize;
		sumPoints.xeye2 = sumPoints.xeye2 + positions[pos];
		sumPoints.yeye2 = sumPoints.yeye2 + positions[pos + 1];
		//console.log("Eye 2 point " +  indexEye2  + ": " +  positions[pos] + "," + positions[pos + 1]);
		indexEye2 ++;
	}

	centerEyePointsAvg.xeye1 = sumPoints.xeye1 / eyePoints.sizeeye;
	centerEyePointsAvg.yeye1 = sumPoints.yeye1 / eyePoints.sizeeye;
	centerEyePointsAvg.xeye2 = sumPoints.xeye2 / eyePoints.sizeeye;
	centerEyePointsAvg.yeye2 = sumPoints.yeye2 / eyePoints.sizeeye;

	//console.log("Eye 1 center point: " +  centerEyePointsAvg.xeye1 + "," + centerEyePointsAvg.yeye1);
	//console.log("Eye 2 center point: " +  centerEyePointsAvg.xeye2 + "," + centerEyePointsAvg.yeye2);

	//debugger
	positions = testPoints.geometry.attributes.position.array;
	let x,y,z;
	let index = 0;
	const depth = 3;
	//for (let i=0; i< 6; i++) {
		positions[ 0 ] = centerEyePointsAvg.xeye1;
		positions[ 1] = centerEyePointsAvg.yeye1;
		positions[ 3 ] = centerEyePointsAvg.xeye2;
		positions[ 4 ] = centerEyePointsAvg.yeye2;
		positions[ 2 ] = positions[ 5 ] =  depth;

  //}
	//calculates points eyesDistance
	eyesDistanceValue = Math.hypot(centerEyePointsAvg.xeye2 - centerEyePointsAvg.xeye1, centerEyePointsAvg.yeye2 - centerEyePointsAvg.yeye1 );

	return eyesDistanceValue;
}

function scalateObjectToFace(eyesdistance, object){

	if(!eyesdistance)
		return;
	let bboxdistancex = object.max.x - object.min.x;
	let scalatecoeficient = eyesdistance / bboxdistancex ;
	let scalevalue = (bboxdistancex * scalatecoeficient) / 2;

	const selectedPoint = 17;
	x = positions[selectedPoint * vectorSize];
	y = positions[selectedPoint * vectorSize + 1];
	selectedObject = scene.getObjectByName("cap");
	//calcular bbox cap
	selectedObject.position.set(x,y,0);
	selectedObject.scale.set(scalevalue.toFixed(2), scalevalue.toFixed(2), scalevalue.toFixed(2));

}
