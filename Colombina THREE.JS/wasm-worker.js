var Module = {};
//importScripts('cv-wasm.js', 'worker.js');
importScripts('CVBridge.js', 'worker2.js');
postMessage({msg: 'wasm'});
