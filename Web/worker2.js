let ptr;
let cvbridge;

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

	//usa un callback para cuando se cargue
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
	let facialPointsInfo = cvbridge.processFrame(ptr);
	//console.log(facialPoints);
	for (let i = 0; i < facialPointsInfo[3].size(); i++) {
	  facialPointsArray.push({
	    x: facialPointsInfo[3].get(i)[0],
	    y: facialPointsInfo[3].get(i)[1]
	  });
	}

	//row, pitch and yaw first 3 positions
	let anglesFace = [];
	for (let i = 0; i < 3; i++){
		let angle = facialPointsInfo[i] * (3.1416/180)
		anglesFace.push(angle);
	}

	let scale = facialPointsInfo[4];

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
