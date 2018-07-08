let app = {};
let asmWorker = new Worker('asm-worker.js');

// standard global variables
const MAX_POINTS = 68;

function setCanvases(){
	app.video = document.querySelector("#monitor");

	app.width = 640;
	app.height = 480;
	app.scale = 2;

	app.dummy = {};
	app.dummy.canvas = document.getElementById('dummy');
	app.dummy.context = app.dummy.canvas.getContext('2d');
	app.dummy.canvas.width = app.width;
	app.dummy.canvas.height = app.height;
}

navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.mediaDevices.getUserMedia;
window.URL = window.URL || window.webkitURL;

app.camvideo = document.getElementById('monitor');

function config(){
	let constraints = { audio: false, video: {width:640, height:480}, video: { facingMode: "user" } };

	navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
		 app.video.srcObject = stream;
	 })
	 .catch(function(err) {
		 console.log(err.name);
	});
}

startEnvironment();

function startEnvironment(){
	config();
	setCanvases();
	init();
}

function init()
{
	app.webgl = {};
	app.webgl.scene = new THREE.Scene();
	app.webgl.scene.sceneObjects = [];
	app.webgl.loaderMesh = new LoaderMesh();
	app.webgl.isPainted = false;
	app.container = document.getElementById('canvasWeb');
	app.webgl.ratioPixels = [];
	app.webgl.vectorSize = 3;
	app.webgl.capPoint = 28;
	app.webgl.lipsPoint = 52;

	createCamera();
	createRenderer();
	configureVideoVariables()
	createwWebcamPlane();
	createAmbientLight();
	createFacialPoints();
	createCenterEyePoints();
	createSecondAmbientLight();
	createSimpleLight();
	addSceneObjects();

	app.webgl.bbox = new THREE.Box3();
	app.webgl.calculations = new Calculator(app.webgl.scene.children);
}

function createCamera(){
	const SCREEN_WIDTH = app.container.clientWidth, SCREEN_HEIGHT = app.container.clientHeight;
	const VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 1000;
	app.webgl.camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR);
	app.webgl.camera.position.set(0,0,100);
	app.webgl.camera.lookAt(0, 0, 0);
	app.webgl.scene.add(app.webgl.camera);
}

function createRenderer(){
	app.webgl.renderer = new THREE.WebGLRenderer( {antialias:true} );
	app.webgl.renderer.setSize(app.container.clientWidth, app.container.clientHeight);
	let canvasWebGl = app.webgl.renderer.domElement;
	canvasWebGl.style = "max-width: 100%; height: 100%;";
	app.container.appendChild(canvasWebGl);
}

function configureVideoVariables(){
	app.video = document.getElementById( 'monitor' );
	app.videoImage = document.getElementById( 'videoImage' );
	app.videoImageContext = app.videoImage.getContext( '2d' );
	app.videoImageContext.fillStyle = '#000000'; // background color if no video present
	app.videoImageContext.fillRect( 0, 0, app.videoImage.width, app.videoImage.height );
	app.webgl.videoTexture = new THREE.Texture( app.videoImage );
	app.webgl.videoTexture.wrapS = THREE.RepeatWrapping;
	app.webgl.videoTexture.repeat.x = -1;
	app.webgl.videoTexture.minFilter = THREE.LinearFilter;
	app.webgl.videoTexture.magFilter = THREE.LinearFilter;
}

function createwWebcamPlane(){
	app.webgl.movieMaterial = new THREE.MeshBasicMaterial( { map: app.webgl.videoTexture, overdraw: true } );
	app.webgl.movieGeometry = new THREE.PlaneGeometry( 80, 80, 1, 1 );
	app.webgl.movieScreen = new THREE.Mesh( app.webgl.movieGeometry, app.webgl.movieMaterial );
	app.webgl.movieScreen.name = "movieScreen";
	app.webgl.movieScreen.position.set(0,0,0);
	//define ratio of pixels from video to movieScreen
	app.webgl.ratioPixels.x = app.videoImage.width / app.webgl.movieScreen.geometry.parameters.width;
	app.webgl.ratioPixels.y = app.videoImage.height / app.webgl.movieScreen.geometry.parameters.height;

	app.webgl.scene.add(app.webgl.movieScreen);
}

function createAmbientLight(){
	app.ambientLight = new THREE.AmbientLight( 0x404040 );
	app.webgl.scene.add( app.ambientLight );
}

function createSecondAmbientLight(){
	app.webgl.ambientLight2 = new THREE.AmbientLight(0xffffff, 0.2);
	app.webgl.scene.add(app.webgl.ambientLight2);
}

function createSimpleLight(){
	app.webgl.simpleLight = new THREE.PointLight(0xffffff, 0.8, 18);
	app.webgl.simpleLight.position.set(-3,6,-3);
	app.webgl.simpleLight.castShadow = true;
	app.webgl.simpleLight.shadow.camera.near = 0.1;
	app.webgl.simpleLight.shadow.camera.far = 25;
	app.webgl.scene.add(app.webgl.simpleLight);
}
function createFacialPoints(){
	app.webgl.landmarks = {};
	app.webgl.landmarks.geometry = new THREE.BufferGeometry();
	app.webgl.landmarks.positions = new Float32Array( MAX_POINTS * 3 ); // 3 vertices per point
	app.webgl.landmarks.geometry.addAttribute( 'position', new THREE.BufferAttribute( app.webgl.landmarks.positions, 3 ) );
	app.webgl.landmarks.material = new THREE.PointsMaterial( { color: 0x00ff00, size: 1 } );
  app.webgl.landmarks.points = new THREE.Points(app.webgl.landmarks.geometry,app.webgl.landmarks.material);
	app.webgl.landmarks.points.position.set(0,0,0);
	app.webgl.landmarks.points.name = "facialPoints";
	app.webgl.scene.add( app.webgl.landmarks.points );
}

function createCenterEyePoints(){
	let geometryCenters = new THREE.BufferGeometry();
	let max_test = 2;
	let positionsCenters = new Float32Array( max_test * 3 ); // 3 vertices per point
	geometryCenters.addAttribute( 'position', new THREE.BufferAttribute( positionsCenters, 3 ) );
	let materialCenters = new THREE.PointsMaterial( { color: 0x00ff00 } );
  app.webgl.centerEyePoints = new THREE.Points(geometryCenters,materialCenters);
	app.webgl.centerEyePoints.position.set(0,0,0);
	app.webgl.centerEyePoints.name = "centerEyePoints";
	app.webgl.scene.add( app.webgl.centerEyePoints );
}

function addSceneObjects(){

	//loadInfo(offset, name, facepoint, pathmtl, pathobj)
	let info = app.webgl.loaderMesh.loadInfo(55, "cap", app.webgl.capPoint, "models/cap/cap.jpg", "models/cap/cap.obj");
	app.webgl.loaderMesh.loadModel(info);
	//models/cap/objCap.mtl

	info = app.webgl.loaderMesh.loadInfo(0, "glasses", app.webgl.capPoint, "models/glasses/glasses.jpg", "models/glasses/glasses.obj");
	app.webgl.loaderMesh.loadModel(info);

	info = app.webgl.loaderMesh.loadInfo(0, "moustache", app.webgl.lipsPoint, "models/moustache/Mustache.mtl", "models/moustache/Mustache.obj");
	app.webgl.loaderMesh.loadMeshWithMaterial(info);
}


asmWorker.onmessage = function (e) {
	if (e.data.msg == 'init') {
		startApp();
	}
	else {
		requestAnimationFrame((initTime) => {
					updateScene(e);
					processImageData('faceDetect')
			});
	}
}

function startApp(){
	processImageData('faceDetect');
}

function processImageData(command) {
	let imageData = app.videoImageContext.getImageData(0, 0, videoImage.width, videoImage.height);
	app.dummy.context.drawImage(app.video, 0, 0, imageData.width, imageData.height, 0, 0, Math.round(imageData.width/ app.scale), Math.round(imageData.height/app.scale));
	let message = {
		cmd: command,
		img: app.dummy.context.getImageData(0, 0, Math.round(imageData.width/app.scale), Math.round(imageData.height/app.scale))
	};
	asmWorker.postMessage(message);
}

//Render
function updateScene(e){
	if ( app.video.readyState === app.video.HAVE_ENOUGH_DATA )
	{
		app.videoImageContext.drawImage( app.video, 0, 0, app.videoImage.width, app.videoImage.height );
		if ( app.webgl.videoTexture ){
			app.webgl.videoTexture.needsUpdate = true;
		}
		let facepointslength = e.data.features.length
		hideShowPoints(facepointslength);
		if(facepointslength){
			let updatedpoints = app.webgl.calculations.updateFacialPoints(e, "facialPoints");
			let eyedistance = app.webgl.calculations.calculateEyesDistance(updatedpoints, facepointslength);
			//recorrer objetos anadidos y actualizarlos
			updateSceneObject(eyedistance,updatedpoints, "cap", e.data.scaleValue);
			updateSceneObject(eyedistance,updatedpoints, "moustache", e.data.scaleValue);
			updateSceneObject(eyedistance,updatedpoints, "glasses", e.data.scaleValue);
		}
		//debugger
		if(e.data.angles){
			rotateObj(e.data.angles[1],-e.data.angles[0],-e.data.angles[2],"cap");
			rotateObj(e.data.angles[1],-e.data.angles[0],-e.data.angles[2],"moustache");
			rotateObj(e.data.angles[1],-e.data.angles[0],-e.data.angles[2],"glasses");
			//console.log("Row: " + e.data.angles[0] + " " + "Pitch: " + e.data.angles[1] + " " + "Yaw: " + e.data.angles[2] + " ");
		}

		app.webgl.calculations.scene = app.webgl.scene.children;
		app.webgl.landmarks.points.geometry.attributes.position.needsUpdate = true;
		app.webgl.centerEyePoints.geometry.attributes.position.needsUpdate = true;
		app.webgl.renderer.render( app.webgl.scene, app.webgl.camera );
	}
}

function updateSceneObject(eyedistance, updatedpoints, name, scaleValue){
	let object = app.webgl.scene.getObjectByName(name);
	if (object != undefined){
		app.webgl.bbox = app.webgl.bbox.setFromObject(object);
		scalateObjectToFace(eyedistance, app.webgl.bbox, updatedpoints, object.name, scaleValue);
	}
}

function scalateObjectToFace(eyesdistance, object, positions, name, scaleValue){

	if(!eyesdistance)
		return;
	// let app.bboxdistancex = object.max.x - object.min.x;
	// let scalatecoeficient = eyesdistance / app.bboxdistancex ;
	// let scalevalue = (app.bboxdistancex * scalatecoeficient) / 2;
	scaleValue = scaleValue.toFixed(2)*6;
	let selectedObject = app.webgl.scene.getObjectByName(name);
	x = positions[selectedObject.facialpoint * app.webgl.vectorSize]-1;
	y = positions[selectedObject.facialpoint * app.webgl.vectorSize + 1] + (selectedObject.offset * scaleValue)/16;

	selectedObject.position.set(x,y,0);
	selectedObject.scale.set(scaleValue, scaleValue, scaleValue);

}

function hideShowPoints(facialPointsLength){
	if(facialPointsLength === 0 && app.webgl.isPainted != false){
		app.webgl.scene.remove(app.webgl.landmarks.points);
		app.webgl.scene.remove(app.webgl.centerEyePoints);
		hideObjects(false);
	}
	else if (facialPointsLength != 0 && app.webgl.isPainted != true) {
		app.webgl.scene.add(app.webgl.landmarks.points);
		app.webgl.scene.add(app.webgl.centerEyePoints);
		hideObjects(true);
	}
}

function hideObjects(hideBool){
	for (let i = 0; i < app.webgl.scene.sceneObjects.length; i++) {
		let object = app.webgl.scene.getObjectByName(app.webgl.scene.sceneObjects[i].name);
		if(object != undefined)
			object.visible = hideBool;
	}
	app.webgl.isPainted = hideBool;
}

//e.data.angles[1],-e.data.angles[0],-e.data.angles[2]

function rotateObj(anglex,angley,anglez, name){
	if(app.webgl.scene.getObjectByName(name)==undefined)
		return;
  let object = app.webgl.scene.getObjectByName(name);
	anglex = anglex - object.rotation.x;
	angley = -angley - object.rotation.y;
	anglez = -anglez - object.rotation.z;
  object.rotateX(anglex);
  object.rotateY(angley);
  object.rotateZ(anglez);
}


window.onerror = function (event) {
    console.log(event)
};

window.onbeforeunload = function() {
	let msg = {
			cmd: 'exit'
	};
	asmWorker.postMessage(msg);
}
