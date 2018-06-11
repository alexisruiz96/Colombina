let ptr;
let cvbridge;

function initMemory(imageData) {

	cvbridge = new Module.CVBridge(imageData.width,imageData.height);
	ptr      = Module._malloc(imageData.width * imageData.height * 4);

}

function faceDetect(imageData) {

	let facialPointsArray = [];


	if (ptr == undefined) {
		try{
			initMemory(imageData);
			console.log("Module object loaded.")
		}
		catch(e){
			console.log("Module object loading...")
			postMessage({ features: facialPointsArray });
			return;
		}
	}

	Module.HEAPU8.set(imageData.data,ptr);
	let facialPoints = cvbridge.processFrame(ptr);

	for (let i = 0; i < facialPoints.size(); i++) {
	  facialPointsArray.push({
	    x: facialPoints.get(i)[0],
	    y: facialPoints.get(i)[1]
	  });
	}

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

console.log('done loading worker')
