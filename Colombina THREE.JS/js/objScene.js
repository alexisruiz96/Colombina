var camera, scene, renderer;
var container;

init();
render();

function init(){
  container = document.createElement('div');
  document.body.appendChild(container);

  //camera
  camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 2000);
  camera.position.set(0,-5,5);
  //scene
  scene = new THREE.Scene();

  //renderer
  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  var planeGeometry = new THREE.PlaneGeometry(10, 20, 32);
  var planeMaterial = new THREE.MeshBasicMaterial( {color: 0xffff00} );
  var plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.position.set(0,0,-1);
  //scene.add(plane);

  //set ambient light
  var light = new THREE.AmbientLight( 0x101030 ); // soft white light
	scene.add( light );

  //obj file
  //GLASSES
	var loader = new THREE.OBJLoader();
	// load a resource
	loader.load(
		// resource
		'Glasses.obj',
		// called when resource is loaded
		function ( object ) {
      object.scale.set(0.5, 0.5, 0.5);
			scene.add( object );
			//object.position.set(0,50,0);

		},
		// called when loading is in progresses
		function ( xhr ) {

			console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

		},
		// called when loading has errors
		function ( error ) {

			console.log( 'An error happened' );

		}
	);

  camera.lookAt(scene.children[0].position);
}

function render(){
  requestAnimationFrame(render);
  renderer.render(scene,camera);
}
