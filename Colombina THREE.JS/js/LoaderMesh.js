class LoaderMesh {

  constructor() {
      this.materialLoader = new THREE.MTLLoader();
      //this.objectLoader = new THREE.OBJLoader();
  }

  loadMeshWithMaterial(pathmaterial, pathobject, name){

    let pathmat = pathmaterial;
    let pathobj = pathobject;
    this.materialLoader.load(pathmat, function(materials){

  		materials.preload();
  		let objectLoader = new THREE.OBJLoader();
  		objectLoader.setMaterials(materials);

  		objectLoader.load(pathobj, function(mesh){
  			mesh.name = name;
  			mesh.traverse(function(node){
  				if( node instanceof THREE.Mesh ){
  					node.castShadow = true;
  					node.receiveShadow = true;
  				}
  			});

  			scene.add(mesh);
  		});

  	});

  }
}
