class LoaderMesh {

  constructor() {
      this.materialLoader = new THREE.MTLLoader();
  }

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

  loadModel(info) {

    let pathtext = info.pathmtl;
    let pathobj = info.pathobj;
    var texture = new THREE.Texture();
    var loader = new THREE.ImageLoader(  );
    loader.load( pathtext, function ( image ) {
        texture.image = image;
        texture.needsUpdate = true;
    } );

    /*var normal_texture = new THREE.Texture();
    loader.load( 'assets/lee_normal_tangent.jpg', function ( image ) {

        normal_texture.image = image;
        normal_texture.needsUpdate = true;
    } );
  */
    var material = new THREE.MeshPhongMaterial( {
        specular: 0x222222,
        shininess: 35,
        map: texture,
        normalScale: new THREE.Vector2( 0.8, 0.8 )
    } );

    loader = new THREE.OBJLoader();
    loader.load(pathobj, function(object) {
        object.name = info.name;
        object.offset = info.offset;
        object.facialpoint = info.facepoint;
        object.traverse( function ( child ) {
            if ( child instanceof THREE.Mesh ) {
                child.material = material;
                child.receiveShadow = true;
                child.castShadow = true;
                child.position.y -= 10;
            }
        } );
    

        scene.sceneObjects.push(object);
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
