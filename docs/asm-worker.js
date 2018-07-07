var Module = {};
importScripts('CVBridge.js', 'worker2.js');
// postMessage({msg: 'asm'});
// postMessage({msg: 'asm'});
Module['onRuntimeInitialized'] = function() { postMessage({msg: 'init'});};
