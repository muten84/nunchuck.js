# nunchuck.js
Node.js module for nunchuck controller device, provides a device and a decoder object. 
The device object enables to read raw data:
  var nunchuckModules = require('nunchuck-js').nunchuck;
    var NunchuckDevice = nunchuckModules.device;

The decoder use the device to decode raw data in a human readable style.
    var nunchuckModules = require('nunchuck-js').nunchuck;
    var NunchuckDecoder = nunchuckModules.decoder;
