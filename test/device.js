var rewire = require("rewire");
var sinon = require('sinon');
var testModule = '../src/nunchuck-i2c/nunchuck.js';

function mod(){
  return require(testModule);
}

function rewireI2C(thisBus){
  var mod = rewire(testModule);
  var i2cBus = {};
  var i2c = {};
  i2cBus.i2cWriteSync = function(addr,length,buffer){
    console.log('i2cWriteSync: '+addr,length,buffer);
  }
  i2cBus.i2cReadSync = function(addr,length,buffer){
    console.log('i2cReadSync: '+addr,length,buffer);
  }
  i2cBus.closeSync = function(){
    console.log('closeSync: ');
  }

  i2c.openSync = function(bus){
    console.log('open sync bus: '+bus);
    return i2cBus;
  }


  mod.__set__("i2c", thisBus||i2c);
  return mod;
}

describe('NunchuckDevice', function () {

  describe('base init()', function () {
    it('should correctly init the device', function () {
      var device = rewireI2C();
      var nunchuck = new device(0x52,1,[]);
      var spy = sinon.spy(nunchuck, "init");
      spy.withArgs(1);
      nunchuck.init(1);
      spy.withArgs(1).calledOnce.should.be.ok;
      nunchuck.should.have.property('status', 'connected');
      nunchuck.getStatus().should.equal("connected");
    });

    it('should init and start the device', function () {
      var device = rewireI2C();
      var nunchuck = new device(0x52,1,[]);
      var spyStart = sinon.spy(nunchuck, "start");
      nunchuck.init(1);
      nunchuck.should.have.property('status', 'connected');
      nunchuck.start();
      nunchuck.should.have.property('status', 'started');
      nunchuck.getStatus().should.equal("started");
    });

    it('should throw an error during init', function () {
      var device = mod();
      var nunchuck = new device(0x52,1,[]);
      var spy = sinon.spy(nunchuck, "init");
      nunchuck.init.should.throw();
      //nunchuck.init(1);
      spy.withArgs(1).calledOnce.should.be.ok;
    });

    it('should start and stop the device', function () {
      var device = rewireI2C();
      var nunchuck = new device(0x52,1,[]);
      var spyStart = sinon.spy(nunchuck, "start");
      nunchuck.init(1);
      nunchuck.should.have.property('status', 'connected');
      nunchuck.start();
      nunchuck.should.have.property('status', 'started');
      nunchuck.getStatus().should.equal("started");
      nunchuck.stop();
      nunchuck.should.have.property('status', 'stopped');
    });

  });
});
