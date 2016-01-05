var center = 128;
var currentX = center;
var currentY = center;
var lastXEvent = "";
var lastYEvent = "";
var ZEROG_VOLTAGE=1.65;
var SENSITIVITY = 0.0188; //478.5mV/g or 0.0188 or 18mg
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
  this.device = device;
}

NunchuckDecoder.prototype.start = function(cb){
  var decoder = this;
  this.device.start(function(data){
      var decoded = decoder.decode(data);
      cb(decoded);
  });

  this.decode = function(buffer){
    var value = -1;
    //x -y..etc
    var i = -1;
    var values = [lastXEvent,lastYEvent,'aX','aY','aZ'];
    var read = [];
    //buffer
    for(i=0; i<buffer.length; i++){
      read[i] = buffer.readUInt8(i);
    }

    values[0] = device.decodeX(read[0]);
    values[1] = device.decodeY(read[1]);
    values[2] = device.decodeC(read[2]);
    values[3] = device.decodeZ(read[3]);
    var currAx = read[4];
    var currAy = read[5];
    var currAz = read[6];
    //values[4] =  currAx;
    //values[5] = device.decodeAxAvg(currAx);
    var motion= device.decodeMotion(currAx,currAy,currAz);
    values[4] = device.decodeAxG(currAx);
    values[5] = device.decodeAxAngle(device.decodeAxG(currAx),motion)
    //values[5] = device.decodeAxAngle2(currAy,currAz);
    values[6] = device.decodeAx(currAx);
    values[7] = device.decodeAy(currAy);
    values[8] = device.decodeAz(currAz);

    return values;
  }

  this.decodeC = function(newC){
    return newC == 0?"pressed":"idle";
  }

  this.decodeZ = function(newZ){
    return newZ == 0?"pressed":"idle";
  }

  this.decodeMotion = function(newX,newY,newZ){
    var s = newX*newX + newY*newY + newZ*newZ;
    var mAccelCurrent = Math.sqrt(s);
    mAccel = (mAccel * 0.9) + (mAccelCurrent * 0.1);
    return mAccel;
  }

  this.decodeAxG = function(newAx){
    var voltsAx	= newAx * 3.3 / 255;
    var deltaVoltsAx = voltsAx - ZEROG_VOLTAGE;
    var AXg = deltaVoltsAx / SENSITIVITY;
    return AXg;
  }

  //source http://www.starlino.com/imu_guide.html
  this.decodeAxAngle = function(axg,r){
    var radians = Math.acos(axg/r)
    return (radians*180)/3.14;
  }

  this.decodeAxAngle2 = function(newAy,newAz){
    var y_val = newAy;
    var z_val = newAz;
    var y2 = (y_val*y_val);
    var z2 = (z_val*z_val);
    //X Axis
    var result=Math.sqrt(y2+z2);
    var radians=Math.atan(result);
    return (radians*180)/3.14;
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

  this.decodeAx= function(newAx){
    var toRet = "" ;
    if(newAx === 0){
        toRet= "tilt-left";
        lastAxValue = newAx;
        return toRet;
    }
    if(newAx === 255){
        toRet= "tilt-right";
        lastAxValue = newAx;
        return toRet;
    }
    return newAx;
    // var diffAx = newAx - lastAxValue;
    // if(diffAx===0){
    //   toRet= newAx;
    // }
    // if(diffAx<0){
    //   toRet= diffAx;
    // }
    // if(diffAx>0){
    //   toRet= diffAx;
    // }
    // lastAxValue = newAx;
    //return toRet;
  }

  this.decodeAy= function(newAy){
    return newAy;
  }

  this.decodeAz= function(newAz){
    return newAz;
  }


  this.decodeY = function(newY){
    var diffY = newY - (center+(device.threshholdY||def_threshholdY));
    var yEvent;
    if(diffY==0 || diffY==-1){
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
    var diffX = newX - (center+(device.threshholdX||def_threshholdX));
    var xEvent;
    if(diffX==0 || diffX ==-1){
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
}

module.exports = NunchuckDecoder;
