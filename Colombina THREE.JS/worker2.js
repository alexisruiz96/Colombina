var init;
var ptr;
var cvbridge;

function initMemory(imageData) {

	cvbridge = new Module.CVBridge(imageData.width,imageData.height);
	ptr      = Module._malloc(imageData.width * imageData.height * 4);

}

function faceDetect(imageData) {

	let facialPointsArray = [];

	if (ptr == undefined) {
		initMemory(imageData);
	}

	//var ptr= Module._malloc(imageData.width * imageData.height * 4);

	Module.HEAPU8.set(imageData.data,ptr);
	var facialPoints = cvbridge.processFrame(ptr);
  //cvbridge.delete();

  for (let i = 0; i < facialPoints.size(); i++) {
    facialPointsArray.push({
      x: facialPoints.get(i)[0],
      y: facialPoints.get(i)[1],
			z: 3
    });
  }

  //Module._free(ptr);

	postMessage({ features: facialPointsArray });
}

self.onmessage = function (e) {
	switch (e.data.cmd) {
		case 'faceDetect':
			faceDetect(e.data.img);
			break;
	}
}

self.onerror = function (e) {
	console.log(e);
}
debugger
console.log('done loading worker')
