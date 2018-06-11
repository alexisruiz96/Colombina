
function faceDetect(imageData) {

  debugger

	var ptr= Module._malloc(imageData.width * imageData.height * 4);
	Module.HEAPU8.set(imageData.data,ptr);
  console.log(imageData.width);
  console.log(imageData.height);
	var cvbridge = new Module.CVBridge(imageData.width,imageData.height);
	var points = cvbridge.processFrame(ptr);
  cvbridge.delete();

  let rects = [];

  for (let i = 0; i < points.size(); i++) {
    let point = points.get(i);
    rects.push({
      x: point[0],
      y: point[1]
    });
  }
  console.log(rects.length);
  Module._free(ptr);

	postMessage({ features: rects });

	img.delete();
	faces.delete();
	img_gray.delete();

  /***************************************/
}

self.onmessage = function (e) {
  debugger
	switch (e.data.cmd) {
		case 'faceDetect':
			faceDetect(e.data.img);
			break;
	}
}

self.onerror = function (e) {
	console.log(e);
}
console.log('done loading worker')
