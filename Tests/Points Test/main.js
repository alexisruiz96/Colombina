// three.js animataed line using BufferGeometry

var renderer, scene, camera;

//declarar array de vector 3
//en cada update actualzar en la escena esos puntos
//actualizar en paralelo esos puntos
var line;
var MAX_POINTS = 68;
var drawCount;

init();
animate();

function init() {

	// info
	var info = document.createElement( 'div' );
	info.style.position = 'absolute';
	info.style.top = '30px';
	info.style.width = '100%';
	info.style.textAlign = 'center';
	info.style.color = '#fff';
	info.style.fontWeight = 'bold';
	info.style.backgroundColor = 'transparent';
	info.style.zIndex = '1';
	info.style.fontFamily = 'Monospace';
	info.innerHTML = "three.js animataed line using BufferGeometry";
	document.body.appendChild( info );

	// renderer
	renderer = new THREE.WebGLRenderer();
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );

	// scene
	scene = new THREE.Scene();

	// camera
	camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 10000 );
	camera.position.set( 0, 0, 1000 );

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
  meshpoints = new THREE.Points(geometry,material);
	scene.add( meshpoints );

	// update positions
	updatePositions();

}

// update positions
function updatePositions() {

	var positions = meshpoints.geometry.attributes.position.array;

	var x = y = z = index = 0;

	for ( var i = 0, l = MAX_POINTS; i < l; i ++ ) {

		positions[ index ++ ] = x;
		positions[ index ++ ] = y;
		positions[ index ++ ] = z;

		x += ( Math.random() - 0.5 ) * 15;
		y += ( Math.random() - 0.5 ) * 15;
		z += ( Math.random() - 0.5 ) * 15;

	}

}

// render
function render() {

	renderer.render( scene, camera );

}

// animate
function animate() {

	requestAnimationFrame( animate );

	drawCount = ( drawCount + 1 ) % MAX_POINTS;

	if ( drawCount === 0 ) {

		// periodically, generate new data

		updatePositions();

		meshpoints.geometry.attributes.position.needsUpdate = true; // required after the first render

	}

	render();

}
