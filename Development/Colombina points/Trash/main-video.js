let asmWorker = new Worker('asm-worker.js');
let wasmWorker = new Worker('wasm-worker.js');


let video = document.querySelector("#videoElement");
let objType = 'faceDetect';


// check for getUserMedia support
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia || navigator.oGetUserMedia;

if (navigator.getUserMedia) {
    // get webcam feed if available
    navigator.getUserMedia({ video: true }, handleVideo, () => console.log('error with webcam'));
    // setTimeout(detect, 8000)
}

document.addEventListener('DOMContentLoaded', function () {
    console.log('dom loaded')
}, false);

//Contains a url that points to the document file
function handleVideo(stream) {
    video.src = window.URL.createObjectURL(stream);
}

let canvases = {};
canvases.running = false;
canvases.ready = false;
canvases.wasm = {};
canvases.asm = {};

canvases.wasm.fps = 0;
canvases.asm.fps = 0;

canvases.wasm.lastTime = +new Date;
canvases.asm.lastTime = +new Date;

canvases.wasm.fpsArr = [];
canvases.asm.fpsArr = [];

canvases.wasm.color = 'rgba(255, 0, 0, 1)';
canvases.asm.color = 'rgba(0, 191, 255, 1)';
canvases.width = 320;
canvases.height = 240;
canvases.scale = 2;

canvases.wasm.canvas = document.getElementById('wasm');
canvases.wasm.context = canvases.wasm.canvas.getContext('2d');
canvases.wasm.canvas.width = canvases.width;
canvases.wasm.canvas.height = canvases.height;

canvases.asm.canvas = document.getElementById('asm');
canvases.asm.context = canvases.asm.canvas.getContext('2d');
canvases.asm.canvas.width = canvases.width;
canvases.asm.canvas.height = canvases.height;

canvases.dummy = {};
canvases.dummy.canvas = document.getElementById('dummy');
canvases.dummy.context = canvases.dummy.canvas.getContext('2d');
canvases.dummy.canvas.width = canvases.width;
canvases.dummy.canvas.height = canvases.height;

function detect(type) {
    if (!canvases.running) {
        canvases.running = true;
        startWorker(canvases.wasm.context.getImageData(0, 0, canvases.wasm.canvas.width, canvases.wasm.canvas.height), objType, 'wasm');
        startWorker(canvases.asm.context.getImageData(0, 0, canvases.asm.canvas.width, canvases.asm.canvas.height), objType, 'asm');
    }
}

function startWorker(imageData, command, type) {
    if (type == 'wasm')
        canvases.dummy.context.drawImage(wasm, 0, 0, imageData.width, imageData.height, 0, 0, Math.round(imageData.width/ canvases.scale), Math.round(imageData.height/canvases.scale));
    let message = {
        cmd: command,
        img: canvases.dummy.context.getImageData(0, 0, Math.round(imageData.width/ canvases.scale), Math.round(imageData.height/canvases.scale))
    };
    if (type == 'wasm') wasmWorker.postMessage(message);
    else if (type == 'asm') asmWorker.postMessage(message);
}

//CREO QUE NO HACE FALTA ESTA FUNCION
function selectObj(type) {
    if (type == 'face') {
        objType = 'faceDetect';
        document.getElementById('radio-face').checked = true;
        document.getElementById('radio-eyes').checked = false;
    }
    return;
}

function updateCanvas(e, targetCanvas) {
    targetCanvas.context.drawImage(video, 0, 0, targetCanvas.canvas.width, targetCanvas.canvas.height);
    targetCanvas.context.strokeStyle = targetCanvas.color;
    targetCanvas.context.lineWidth = 2;
    for (let i = 0; i < e.data.features.length; i++) {
        let rect = e.data.features[i];
        targetCanvas.context.strokeRect(rect.x * canvases.scale, rect.y * canvases.scale, rect.width * canvases.scale, rect.height * canvases.scale);
    }
}

//PRIMER IF NO LO TENGO CLARO
wasmWorker.onmessage = function (e) {
    if (e.data.msg == 'wasm') {
        if (canvases.ready) {
            setTimeout(detect, 2000) }
        else {
            canvases.ready = true
        }
    }
    else {
        updateCanvas(e, canvases.wasm);
        requestAnimationFrame((wasmTime) => {
            canvases.wasm.startTime = wasmTime;
            startWorker(canvases.wasm.context.getImageData(0, 0, canvases.wasm.canvas.width, canvases.wasm.canvas.height), objType, 'wasm')
        })
    }
}

asmWorker.onmessage = function (e) {
    if (e.data.msg == 'asm') {
        if (canvases.ready) { setTimeout(detect, 2000)}
        else {
            canvases.ready = true
        }
    }
    else {
        updateCanvas(e, canvases.asm);
        requestAnimationFrame((asmTime) => {
            canvases.asm.startTime = asmTime;
            startWorker(canvases.asm.context.getImageData(0, 0, canvases.asm.canvas.width, canvases.asm.canvas.height), objType, 'asm')
        });
    }
}

window.onerror = function (event) {
    console.log(event)
};
