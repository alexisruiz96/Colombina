var init;
var ptr;
var cvbridge;

function initMemory(imageData) {

	cvbridge = new Module.CVBridge(imageData.width,imageData.height);
	ptr      = Module._malloc(imageData.width * imageData.height * 4);
 
}

function faceDetect(imageData) {

	let rects = [];

	if (ptr == undefined) {
		initMemory(imageData);	
	}

	//var ptr= Module._malloc(imageData.width * imageData.height * 4);
	
	Module.HEAPU8.set(imageData.data,ptr);
	//var cvbridge = new Module.CVBridge(imageData.width,imageData.height);
	var rect = cvbridge.processFrame(ptr);
	//cvbridge.delete();

	rects.push({
		x: rect[0],
		y: rect[1],
		width: rect[2],
		height: rect[3]
	});

	postMessage({ features: rects });
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
