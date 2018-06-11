function rotateObj(anglex,angley,anglez){
  let cap = scene.getObjectByName("cap");

  cap.rotateX(anglex);
  cap.rotateY(angley);
  cap.rotateZ(anglez);
}
