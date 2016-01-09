var center = 128;
var defThreshholdX = 142-center;
var defThreshholdY = 138-center;
var lastXEvent = '';
var lastYEvent = '';
var ZEROG_VOLTAGE=1.65;
var SENSITIVITY = 0.0098; //478.5mV/g or 0.0188 or 18mg
var ZERO_AX = 137;
var ZERO_AY = 135;
var ZERO_AZ = 175;
var lastAxValue = ZERO_AX;
var axIdx = 0;
var aXAverage = ZERO_AX;
var aXBuffer = [];
var mAccel = Math.sqrt(ZERO_AX*ZERO_AX+ZERO_AY*ZERO_AY+ZERO_AZ*ZERO_AZ);


var NunchuckDecoder = function(device){
  //device should be initialized
  console.log('Using device: '+device);
  this.device = device;
}

NunchuckDecoder.prototype.getDevice = function(){
    return this.device;
}

NunchuckDecoder.prototype.asObject = function(values){
  var o = {};
  var stick = {};
  stick.xDirection = values[0];
  stick.yDirection = values[1];
  stick.x = values[11];
  stick.y = values[12];

  var buttons = {};
  buttons.C = values[2];
  buttons.Z = values[3];

  var accelerometer = {};
  accelerometer.aX = values[4];
  accelerometer.aY = values[5];
  accelerometer.aZ = values[6];

  var motion = {};
  motion.accel = values[13];
  motion.tilt = values[10];

  var rotation = {};
  rotation.x = values[7];
  rotation.y = values[8];
  rotation.z = values[9];

  o.stick =  stick;
  o.buttons =  buttons;
  o.accelerometer =  accelerometer;
  o.motion =  motion;
  o.rotation = rotation;
  return o;
}

NunchuckDecoder.prototype.start = function(cb){
  var decoder = this;
  // console.log(">>>>"+device.getStatus());
  if(decoder.device.getStatus()!=='connected'){
    throw new Error('Device MUST be initialized before decoder can use it!');
  }
  this.decode = function(buffer){

    //x -y..etc
    var i = -1;
    var values = [lastXEvent,lastYEvent,'aX','aY','aZ'];
    var read = [];
    //buffer
    for(i=0; i<buffer.length; i++){
      read[i] = buffer.readUInt8(i);
    }
    var toReturn = function(values){
      values[0] = decoder.decodeX(read[0]);
      values[1] = decoder.decodeY(read[1]);
      values[2] = decoder.decodeC(read[2]);
      values[3] = decoder.decodeZ(read[3]);
      var currAx = read[4];
      var currAy = read[5];
      var currAz = read[6];
      var motion= decoder.decodeMotion(currAx,currAy,currAz);
      values[4] = decoder.decodeAx(currAx);
      values[5] = decoder.decodeAy(currAy);
      values[6] = decoder.decodeAz(currAz);
      values[7] = decoder.decodeAngle(decoder.decodeAccelInG(currAx),motion);
      values[8] = decoder.decodeAngle(decoder.decodeAccelInG(currAy),motion);
      values[9] = decoder.decodeAngle(decoder.decodeAccelInG(currAz),motion);
      var tilt = decoder.decodeLRTilt(currAx);
      if(tilt==='idle'){
        tilt = decoder.decodeUDTilt(currAy)
      }
      values[10] = tilt;
      values[11] = read[0];
      values[12] = read[1];
      values[13] = motion;
      return values;
    }(values);
    return toReturn;
  }

  this.decodeC = function(newC){

    return newC === 0?'pressed':'idle';
  }

  this.decodeZ = function(newZ){

    return newZ === 0?'pressed':'idle';
  }

  this.decodeMotion = function(newX,newY,newZ){

    var s = newX*newX + newY*newY + newZ*newZ;
    var mAccelCurrent = Math.sqrt(s);
    mAccel = (mAccel * 0.9) + (mAccelCurrent * 0.1);
    return mAccel;
  }

  this.decodeAccelInG = function(newAx){

    var voltsAx	= newAx * 3.3 / 255;
    var deltaVoltsAx = voltsAx - ZEROG_VOLTAGE;
    var AXg = deltaVoltsAx / SENSITIVITY;
    return AXg;
  }

  //source http://www.starlino.com/imu_guide.html
  this.decodeAngle = function(ag,r){

    var radians = Math.acos(ag/r)
    return radians;
    //return (radians*180)/3.14;
  }

  this.decodeAxAvg = function(newAx){

    var newAxAvg = aXAverage;
    aXBuffer[axIdx] = newAx;
    axIdx++;
    if(axIdx===10){
      newAxAvg = avg(aXBuffer);
      aXAverage = newAxAvg;
      aXBuffer = [];
      axIdx = 0;
    }
    return aXAverage;
  }

  this.decodeLRTilt = function(newAx){

    if(newAx === 0 && lastAxValue!=='tilt-left'){
      toRet= 'tilt-left';
      lastAxValue = newAx;
      return toRet;
    }
    else if(newAx === 255 && lastAxValue!=='tilt-right'){
      toRet= 'tilt-right';
      lastAxValue = newAx;
      return toRet;
    }
    else{
      return 'idle';
    }
  }

  this.decodeUDTilt = function(newAy){

    if(newAy === 0 && lastAyValue!=='tilt-down'){
      toRet= 'tilt-down';
      lastAyValue = newAy;
      return toRet;
    }
    else if(newAy === 255 && lastAxValue!=='tilt-up'){
      toRet= 'tilt-up';
      lastAxValue = newAy;
      return toRet;
    }
    else{
      return 'idle';
    }
  }

  this.decodeAx= function(newAx){

    return newAx;
  }

  this.decodeAy= function(newAy){

    return newAy;
  }

  this.decodeAz= function(newAz){

    return newAz;
  }


  this.decodeY = function(newY){

    var diffY = newY - (center+(decoder.threshholdY||defThreshholdY));
    var yEvent;
    if(diffY===0 || diffY===-1){
      yEvent = 'center';
    }
    else if(diffY>=0){
      //UP
      yEvent = 'up'
    }
    else if(diffY<-1){
      //DOWN
      yEvent = 'down'
    }
    return yEvent;
  }

  this.decodeX = function(newX){

    var diffX = newX - (center+(decoder.threshholdX||defThreshholdX));
    var xEvent;
    if(diffX===0 || diffX ===-1){
      xEvent = 'center';
    }
    else if(diffX>=0){
      //RIGHT
      xEvent = 'right'
    }
    else if(diffX<-1){
      //LEFT
      xEvent = 'left'
    }
    return xEvent;
  }

  decoder.device.start(function(data){
    var decoded = decoder.decode(data);
    cb(decoded);
  });
}

module.exports = NunchuckDecoder;
