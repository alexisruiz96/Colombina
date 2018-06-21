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
	//console.log(facialPoints);
	for (let i = 0; i < facialPoints[3].size(); i++) {
	  facialPointsArray.push({
	    x: facialPoints[3].get(i)[0],
	    y: facialPoints[3].get(i)[1]
	  });
	}

	//row, pitch and yaw first 3 positions
	let anglesFace = [];
	for (let i = 0; i < 3; i++){
		let angle = facialPoints[i] * (3.1416/180)
		anglesFace.push(angle);
	}

	//let R = facialPoints[0];
	//let P = facialPoints[1];
	//let Y = facialPoints[2];

	postMessage({ features: facialPointsArray, angles: anglesFace });
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
