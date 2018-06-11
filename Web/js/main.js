// MAIN
let asmWorker = new Worker('asm-worker.js');
let video = document.querySelector("#monitor");

// standard global variables
let container, scene, camera, renderer, controls, stats;
const objType = 'faceDetect';

// custom global variables
let videoImage, videoImageContext, videoTexture, facialPoints, cap, bbox,
centerEyePoints, calculations, loadermesh, isPainted,selectedObject;
let ratioPixels = infoObjects = sceneObjects =  [];
const MAX_POINTS = 68;
let vectorSize = 3;
let capPoint = 28;
let lipsPoint = 52;

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

navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.mediaDevices.getUserMedia;
window.URL = window.URL || window.webkitURL;

let camvideo = document.getElementById('monitor');

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
	{  
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

//Necesario abstraer la parte THREEJS a una capa inferior
startEnvironment();

function startEnvironment(){
	config();
	init();
	update();
}



function createCamera(){

	const SCREEN_WIDTH = container.clientWidth, SCREEN_HEIGHT = container.clientHeight;
	const VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 1000;
	camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR);
	camera.position.set(0,0,100);
	camera.lookAt(0, 0, 0);
	scene.add(camera);

}
function createRenderer(){
	renderer = new THREE.WebGLRenderer( {antialias:true} );
	renderer.setSize(container.clientWidth, container.clientHeight);
	container.appendChild( renderer.domElement );
}

function configureVideoVariables(){
	video = document.getElementById( 'monitor' );
	videoImage = document.getElementById( 'videoImage' );
	videoImageContext = videoImage.getContext( '2d' );
	videoImageContext.fillStyle = '#000000'; // background color if no video present
	videoImageContext.fillRect( 0, 0, videoImage.width, videoImage.height );
	videoTexture = new THREE.Texture( videoImage );
	videoTexture.minFilter = THREE.LinearFilter;
	videoTexture.magFilter = THREE.LinearFilter;
}

function createwWebcamPlane(){
	let movieMaterial = new THREE.MeshBasicMaterial( { map: videoTexture, overdraw: true } );
	let movieGeometry = new THREE.PlaneGeometry( 80, 80, 1, 1 );
	let movieScreen = new THREE.Mesh( movieGeometry, movieMaterial );
	movieScreen.name = "movieScreen";
	movieScreen.position.set(0,0,0);

	//define ratio of pixels from video to movieScreen
	ratioPixels.x = videoImage.width / movieScreen.geometry.parameters.width;
	ratioPixels.y = videoImage.height / movieScreen.geometry.parameters.height;

	scene.add(movieScreen);
}

function createAmbientLight(){
	let light = new THREE.AmbientLight( 0x404040 );
	scene.add( light );
}

function createSecondAmbientLight(){
	ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
	scene.add(ambientLight);
}

function createSimpleLight(){
	light = new THREE.PointLight(0xffffff, 0.8, 18);
	light.position.set(-3,6,-3);
	light.castShadow = true;
	light.shadow.camera.near = 0.1;
	light.shadow.camera.far = 25;
	scene.add(light);
}
function createFacialPoints(){
	let geometry = new THREE.BufferGeometry();
	let positions = new Float32Array( MAX_POINTS * 3 ); // 3 vertices per point
	geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
	let material = new THREE.PointsMaterial( { color: 0xff0000, size: 2 } );
  	facialPoints = new THREE.Points(geometry,material);
	facialPoints.position.set(0,0,0);
	facialPoints.name = "facialPoints";
	scene.add( facialPoints );
}

function createCenterEyePoints(){
	let geometryCenters = new THREE.BufferGeometry();
	let max_test = 2;
	let positionsCenters = new Float32Array( max_test * 3 ); // 3 vertices per point
	geometryCenters.addAttribute( 'position', new THREE.BufferAttribute( positionsCenters, 3 ) );
	let materialCenters = new THREE.PointsMaterial( { color: 0x00ff00 } );
  	centerEyePoints = new THREE.Points(geometryCenters,materialCenters);
	centerEyePoints.position.set(0,0,0);
	centerEyePoints.name = "centerEyePoints";
	scene.add( centerEyePoints );
}

function addSceneObjects(){

	//loadInfo(offset, name, facepoint, pathmtl, pathobj)
	let info = loadermesh.loadInfo(55, "cap", capPoint, "models/cap/objCap.mtl", "models/cap/objCap.obj");
	loadermesh.loadMeshWithMaterial(info);
	//models/cap/objCap.mtl

	info = loadermesh.loadInfo(0, "moustache", lipsPoint, "models/moustache/Mustache.mtl", "models/moustache/Mustache.obj");
	loadermesh.loadMeshWithMaterial(info);
}

function init()
{
	scene = new THREE.Scene();
	scene.sceneObjects = [];
	loadermesh = new LoaderMesh();
	isPainted = false;
	container = document.getElementById( 'canvasWeb' );

	createCamera();
	createRenderer();
	configureVideoVariables()
	createwWebcamPlane();
	window.addEventListener('resize', onWindowsResize, false);
	createAmbientLight();
	createFacialPoints();
	createCenterEyePoints();
	createSecondAmbientLight();
	createSimpleLight();
	addSceneObjects();

	bbox = new THREE.Box3();
	calculations = new Calculator(scene.children);
	startWorker(videoImageContext.getImageData(0, 0, videoImage.width, videoImage.height), objType, 'asm');
}

function startWorker(imageData, command, type) {
  canvases.dummy.context.drawImage(monitor, 0, 0, imageData.width, imageData.height, 0, 0, Math.round(imageData.width/ canvases.scale), Math.round(imageData.height/canvases.scale));
  let message = {
      cmd: command,
      img: canvases.dummy.context.getImageData(0, 0, Math.round(imageData.width/canvases.scale), Math.round(imageData.height/canvases.scale))
  };
  asmWorker.postMessage(message);
}

function update()
{
	requestAnimationFrame( update );
	calculations.scene = scene.children;
	facialPoints.geometry.attributes.position.needsUpdate = true;
	centerEyePoints.geometry.attributes.position.needsUpdate = true;
	render();

}

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
			let facepointslength = e.data.features.length
			hideShowPoints(facepointslength);
			if(facepointslength){
				let updatedpoints = calculations.updateFacialPoints(e, "facialPoints");
				let eyedistance = calculations.calculateEyesDistance(updatedpoints, facepointslength);
				//recorrer objetos anadidos y actualizarlos
				updateSceneObject(eyedistance,updatedpoints, "cap");
				updateSceneObject(eyedistance,updatedpoints, "moustache");
			}
			//rotateObj(1,0,0);
      startWorker(videoImageContext.getImageData(0, 0, videoImage.width, videoImage.height), objType, 'asm');

    }
}

function detect(type) {
    if (!canvases.running) {
        canvases.running = true;
        startWorker(videoImageContext.getImageData(0, 0, videoImage.width, videoImage.height), objType, 'asm');
    }
}

function updateSceneObject(eyedistance, updatedpoints, name){
	let object = scene.getObjectByName(name);
	if (object != undefined){
		bbox = bbox.setFromObject(object);
		scalateObjectToFace(eyedistance, bbox, updatedpoints, object.name);
	}
}

function scalateObjectToFace(eyesdistance, object, positions, name){

	if(!eyesdistance)
		return;
	let bboxdistancex = object.max.x - object.min.x;
	let scalatecoeficient = eyesdistance / bboxdistancex ;
	let scalevalue = (bboxdistancex * scalatecoeficient) / 2;
	selectedObject = scene.getObjectByName(name);
	x = positions[selectedObject.facialpoint * vectorSize]-1;
	y = positions[selectedObject.facialpoint * vectorSize + 1] + (selectedObject.offset * scalatecoeficient)/2;

	selectedObject.position.set(x,y,0);
	selectedObject.scale.set(scalevalue.toFixed(2), scalevalue.toFixed(2), scalevalue.toFixed(2));

}

function hideShowPoints(facialPointsLength){
	let cap = scene.getObjectByName("cap");
	let moustache = scene.getObjectByName("moustache");
	if(facialPointsLength === 0 && isPainted != false){
		scene.remove(facialPoints);
		scene.remove(centerEyePoints);
		//esta parte desaparecera, se añade o se quita de la escena el objeto
		if(cap != undefined)
			cap.visible = false;
		if(moustache != undefined)
			moustache.visible = false;
		isPainted = false;
	}
	else if (facialPointsLength != 0 && isPainted != true) {
		scene.add(facialPoints);
		scene.add(centerEyePoints);
		if(cap != undefined)
			cap.visible = true;
		if(moustache != undefined)
			moustache.visible = true;
		isPainted = true;
	}
}

function rotateObj(anglex,angley,anglez){
  let cap = scene.getObjectByName("cap");
  cap.rotateX(anglex);
  cap.rotateY(angley);
  cap.rotateZ(anglez);
}

function onWindowsResize(){

	camera.aspect = container.clientWidth / container.clientHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(container.clientWidth, container.clientHeight);
	//console.log('Resize!' + container.clientWidth + ' '  + container.clientHeight);
}
