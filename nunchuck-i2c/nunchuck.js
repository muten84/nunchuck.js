var i2c = require('i2c-bus');
var NUNCHUCK_DEVICE = 0x52;


function NunchuckDevice(address, frequency, thresholds){
  this.address = address;
  this.threshholdX = thresholds[0];
  this.threshholdY = thresholds[1];
  this.frequency = frequency;
  this.started = null;
  this.bus = "Bus not initialized";
}

NunchuckDevice.prototype.init = function(busNumber){
  this.bus = i2c.openSync(busNumber || 1);
  this.bus.i2cWriteSync(this.address, 2, new Buffer([0xF0, 0x55]));
  this.bus.i2cWriteSync(this.address, 2, new Buffer([0xFB, 0x00]));
  this.bus.i2cWriteSync(this.address, 2, new Buffer([0x40, 0x00]));
}

NunchuckDevice.prototype.start = function(ondata){
  var buffer = new Buffer(6);
  var device = this;
  this.started = setInterval(function(){
    device.bus.i2cWriteSync(device.address, 1, new Buffer([0x00]));
    device.bus.i2cReadSync(device.address, 6, buffer);
    var decoded = device.parseData(buffer);
    ondata(decoded);
  },device.frequency||1);

  this.parseData = function(buffer){
    var parsed = new Buffer(7);
    parsed[0] = buffer[0]; //x
    parsed[1] = buffer[1]; //y
    parsed[4] = ((buffer[2]) << 2); //aX;
    parsed[5] = ((buffer[3]) << 2); //aY;
    parsed[6] = ((buffer[4]) << 2); //aZ;
    if ((buffer[5] & 0x01)!=0) {parsed[3] = 1; }
    else { parsed[3] = 0; }
    if ((buffer[5] & 0x02)!=0){ parsed[2] = 1; }
    else { parsed[2] = 0; }
    parsed[4] = ((buffer[5] >>2) & 0x03) | parseInt(buffer[2]);
    parsed[5] = ((buffer[5] >>4) & 0x03) | parseInt(buffer[3]);
    parsed[6] = ((buffer[5] >>6) & 0x03) | parseInt(buffer[4]);
    return parsed;
  }
}

NunchuckDevice.prototype.stop = function(){
  clearInterval(this.started);
  this.bus.closeSync();
}

module.exports = NunchuckDevice;