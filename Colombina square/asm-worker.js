var Module = {};
//importScripts('cv-asm.js', 'worker.js');
importScripts('CVBridge.js', 'worker2.js');
postMessage({msg: 'asm'});
