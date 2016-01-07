# nunchuck.js
Node.js module for nunchuck controller device. Provides a device object and a decoder object.
The device object enalbes to receive raw data. A typical usage could be:

```
  var nunchuckModules = require('nunchuck-js').nunchuck;
  var NunchuckDevice = nunchuckModules.device;
  var device = new NunchuckDevice(NUNCHUCK_ADDRESS, 10,[]);
  device.init();
  device.start(function(data){
      var x = data[0]; 
      var y= data[1];  
      var cBtn = data[2]; 
      var zBtn = data[3]; 
      var aX = data[4]; //accelerometer X axis values from 0-255;
      var aY = data[5]; //accelerometer Y axis values from 0-255;
      var aZ = data[6]; //accelerometer Z axis values from 0-255;
  });
  
```
### The device object:
The NunchuckDevice constructor takes 3 parameters:
 - The address od the device (typically 0x52);
 - The request frequency in milliseconds ( 10 => request every 10 ms)
 - An array of values to calibrate the device, if empty will be used default values: [thresholdX, threshoholdY];
 
The start method takes a callback function in input. The callback will be invoked at the requested frequency. 

The data object is an array of length = 7, the value mapping is:
  
 - data[0] X axis of the stick, contains a number value [min=0, max=255];
 - data[1] Y axis of the stick, contains a number value [min=0, max=255];
 - data[2] C button can be 0 or 1;
 - data[3] Z button can be 0 or 1;
 - data[4] X axis of the accelerometer contains a number value [min=0, max=255];
 - data[5] Y axis of the accelerometer contains a number value [min=0, max=255];
 - data[6] Z axis of the accelerometer contains a number value [min=0, max=255];

### The decoder object:
The decoder object wraps a device object and decode raw data in an human readable way. Below a typical example usage:
```
  var nunchuckModules = require('nunchuck-js').nunchuck;
  var NunchuckDevice = nunchuckModules.device;
  var NunchuckDecoder = nunchuckModules.decoder;
  var nunchuck = new NunchuckDevice(NUNCHUCK_ADDRESS, 10,[]);
  nunchuck.init();
  var decoder = new NunchuckDecoder(nunchuck);
  decoder.start(function(stream){
    var hX = stream[0]; //possible values left, right, center
    console.log(hX);
  }
```

###Values returned by the decoder:
Decoder send data in an array of values. The decoder has an utility method to transform the array in a generic JSON object:
```
  decoder.start(function(stream){
    var obj = decoder.asObject(stream);
    console.log(obj.stick.x)
  }
```
Here is the spec of the returned JSON object:
```
var message = {
  stick: {
    x: //['left','center','up']
    y: //['up','center','down']
  }
  buttons:{
    C: //['idle','pressed']
    Z: //['idle','pressed']
  },
  accelerometer:{
    aX: //single X axis acceleration value
    aY: //single Y axis acceleration value
    aZ: //single Z axis acceleration value
  },
  motion:{
    accel: // total acceleration from 3 axes
    tilt: ,//['left', 'right', 'up', 'down']
  },
  rotation{
    x: // x rotation angle in radians (roll)
    y: // y rotation angle in radians (pitch)
    z: // z rotation angle in radians (yaw)
  }
}
```
