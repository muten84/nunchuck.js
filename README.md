# nunchuck.js
Node.js module for nunchuck controller device. Provides a device object and a decoder object.
The device object enalbes to receive raw data. A typical usage could be:

```
  var nunchuckModules = require('nunchuck-js').nunchuck;
  var NunchuckDevice = nunchuckModules.device;
  var device = new NunchuckDevice(NUNCHUCK_ADDRESS, 10,[]);
  device.init();
  device.start(function(data){
      var x = data[0]; //values from 0-255; 0 left; 255 right
      var y= data[1];  //values from 0-255; 0 up; 255 down;
      var cBtn = data[2];  // 0 or 1
      var zBtn = data[3]; // 0 or 1
      var aX = data[4]; //accelerometer X axis values from 0-255;
      var aY = data[5]; //accelerometer Y axis values from 0-255;
      var aZ = data[6]; //accelerometer Z axis values from 0-255;
  });
  
```

The decoder object wrap a device object and decode raw data in an human readable way. Below a typical example usage:
```
  var nunchuckModules = require('nunchuck-js').nunchuck;
  var NunchuckDevice = nunchuckModules.device;
  var NunchuckDecoder = nunchuckModules.decoder;
  var nunchuck = new NunchuckDevice(NUNCHUCK_ADDRESS, 10,[]);
  var decoder = new NunchuckDecoder(nunchuck);
  decoder.start(function(stream){
    var hX = stream[0]; //possible values left, right, center
    console.log(hX);
  }
```
