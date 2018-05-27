class LoaderMesh {

  constructor() {
      this.materialLoader = new THREE.MTLLoader();
      //this.objectLoader = new THREE.OBJLoader();
  }

//wrap things in a variable and pass it
  loadMeshWithMaterial(info){

    let pathmat = info.pathmtl;
    let pathobj = info.pathobj;
    this.materialLoader.load(pathmat, function(materials){

  		materials.preload();
  		let objectLoader = new THREE.OBJLoader();
  		objectLoader.setMaterials(materials);

  		objectLoader.load(pathobj, function(mesh){
  			mesh.name = info.name;
        mesh.offset = info.offset;
        mesh.facialpoint = info.facepoint;
  			mesh.traverse(function(node){
  				if( node instanceof THREE.Mesh ){
  					node.castShadow = true;
  					node.receiveShadow = true;
  				}
  			});

  			scene.sceneObjects.push(mesh);
  		});

  	});

  }
  loadInfo(offset, name, facepoint, pathmtl, pathobj){
    let info = [];
    info.offset = offset;
    info.name = name;
    info.facepoint = facepoint;
    info.pathmtl = pathmtl;
    info.pathobj = pathobj;

    return info;
  }
}
