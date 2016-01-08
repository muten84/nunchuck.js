var rewire = require("rewire");
var sinon = require('sinon');
//var device = require('../src/nunchuck-i2c/nunchuck.js').device;

describe('NunchuckDevice', function () {

  var device = rewire('../src/nunchuck-i2c/nunchuck.js');
  var i2cBus = {};
  var i2c = {};
  i2cBus.i2cWriteSync = function(addr,length,buffer){
    console.log('i2cWriteSync: '+addr,length,buffer);
  }
  i2c.openSync = function(bus){
    console.log('open sync bus: '+bus);
    return i2cBus;
  }

  device.__set__("i2c", i2c);

  describe('init()', function () {
    it('should correctly init the device', function () {
      //var init = sinon.spy();
      var nunchuck = new device(0x52,1,[]);
      var spy = sinon.spy(nunchuck, "init");
      spy.withArgs(1);
      nunchuck.init(1);
      spy.withArgs(1).calledOnce.should.be.ok;
      nunchuck.should.have.property('status', 'initialized');
    })

  });
});
