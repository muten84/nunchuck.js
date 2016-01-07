# nunchuck.js
Node.js module for nunchuck controller device. Provides a device object and a decoder object.
The device object enalbes to receive raw data. A typical usage could be:

```
  var nunchuckModules = require('nunchuck-js').nunchuck;
  var NunchuckDevice = nunchuckModules.device;
  var device = new NunchuckDevice(NUNCHUCK_ADDRESS, 10,[]);
  device.start(function(data){
      var x = data[0];
      var y= data[1];
      var cBtn = data[2];
      var zBtn = data[3];
      var aX = data[4];
      var aY = data[5];
      var aZ = data[6];
  });
  
```
