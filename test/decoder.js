var rewire = require("rewire");
var sinon = require('sinon');
var testModule = '../src/nunchuck-decoder/decoder.js';
var decoderMod = rewire(testModule);
//var rewired = rewire(testModule);

var spec = function (status){
  var deviceSpec = {
    init: function(number) {console.log(">>INIT DEVICE<<<")},
    start: function(callback){
      console.log(">>STARTING THE DEVICE<<");
      setTimeout(callback(new Buffer([130,135,138,240,241,245,255])), 1000);
      setTimeout(callback(new Buffer([133,138,138,240,241,245,255])), 2000);
      setTimeout(callback(new Buffer([134,125,18,20,255,245,255])), 3000);
      setTimeout(callback(new Buffer([135,175,12,240,241,245,255])), 4000);
      setTimeout(callback(new Buffer([0,0,0,0,0,0,0])), 5000);
      setTimeout(callback(new Buffer([255,255,255,255,255,255,255])), 6000);
      setTimeout(callback(new Buffer([142,138,255,255,255,255,255])), 7000);
    },
    stop: function(){console.log(">>STOP DEVICE<<<")},
    getStatus: function(){return status||'disconnected'}
  };
  return deviceSpec;
}


describe('NunchuckDecoder', function () {

  describe('Test suite for decoder object', function () {
    it('should throw error while start the decoder because the device is not initialized', function () {
      var device = spec();
      var mock = sinon.mock(device);
      var spy = sinon.spy(decoderMod);
      spy.calledWithNew().should.be.ok;
      spy.threw().should.be.ok;
      // mock.expects("start").once().throws();
      var decoder = new decoderMod(device);
      try{decoder.start();}catch(err){};
      mock.verify();
      mock.restore();
    });

    it('should start an initialized device', function () {
      var device = spec('connected');
      decoderMod.__set__("device", device);
      var spyConstructor = sinon.spy(decoderMod);
      spyConstructor.calledWithNew().should.be.ok;

      device.init(1);
      var decoder = new decoderMod(device);
      var spy = sinon.spy(decoder, "start");
      spy.calledOnce.should.be.ok;
      decoder.start(function(data){
        console.log(data);
      });
    });

    it('test asObject data', function () {
      var device = spec('connected');
      decoderMod.__set__("device", device);
      var spyConstructor = sinon.spy(decoderMod);
      spyConstructor.calledWithNew().should.be.ok;

      device.init(1);
      var decoder = new decoderMod(device);
      var spy = sinon.spy(decoder, "start");
      spy.calledOnce.should.be.ok;
      decoder.start(function(data){
        var o = decoder.asObject(data);
        o.should.have.property('stick');
        o.stick.should.have.property('x');
        o.stick.should.have.property('y');
        o.stick.should.have.property('xDirection');
        o.stick.should.have.property('yDirection');

        o.should.have.property('buttons');
        o.buttons.should.have.property('C');
        o.buttons.should.have.property('Z');

        o.should.have.property('accelerometer');
        o.accelerometer.should.have.property('aX');
        o.accelerometer.should.have.property('aY');
        o.accelerometer.should.have.property('aZ');

        o.should.have.property('motion');
        o.motion.should.have.property('accel');
        o.motion.should.have.property('tilt');

        o.should.have.property('rotation');
        o.rotation.should.have.property('x');
        o.rotation.should.have.property('y');
        o.rotation.should.have.property('z');

      });
    });
  });

});
