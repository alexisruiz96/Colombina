let ptr;
let cvbridge;
let anglesMax = 3;
let vectorPointsPos = 3;
let scaleFacePos = 4;

function initMemory(imageData) {

	cvbridge = new Module.CVBridge(imageData.width,imageData.height);
	ptr      = Module._malloc(imageData.width * imageData.height * 4);

}

// FacialPointsInfo
// struct jsObj {
// 	float row;
// 	float pitch;
// 	float yaw;
// 	vector<facialPoints>;
// 	float scale;
// };

function faceDetect(imageData) {

	let facialPointsArray = [];

	if (ptr == undefined) {
		try{
			initMemory(imageData);
			console.log("Module object loaded.")
		}
		catch(e){
			console.log(e);
			console.log("Module object loading...")
			postMessage({ features: facialPointsArray });
			return;
		}
	}

	Module.HEAPU8.set(imageData.data,ptr);
	let facialPointsInfo = cvbridge.processFrame(ptr);
	for (let i = 0; i < facialPointsInfo[vectorPointsPos].size(); i++) {
	  facialPointsArray.push({
	    x: facialPointsInfo[vectorPointsPos].get(i)[0],
	    y: facialPointsInfo[vectorPointsPos].get(i)[1]
	  });
	}

	//row, pitch and yaw first 3 positions
	let anglesFace = [];
	for (let i = 0; i < anglesMax; i++){
		let angle = facialPointsInfo[i] * (Math.PI/180)
		anglesFace.push(angle);
	}

	let scale = facialPointsInfo[scaleFacePos];

	postMessage({ features: facialPointsArray, angles: anglesFace, scaleValue: scale});
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
