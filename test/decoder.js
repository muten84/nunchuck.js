var rewire = require("rewire");
var sinon = require('sinon');
var testModule = '../src/nunchuck-decoder/decoder.js';
var decoderMod = require(testModule);

var mockDevice = function (){
  var deviceSpec = {
     init: function(number) {},
     start: function(callback){},
     stop: function(){}
   };
   var mock = sinon.mock(deviceSpec);
   return mock;
}

describe('NunchuckDecoder', function () {

  describe('base init()', function () {
    it('should init the decoder', function () {
        var device = mockDevice();
        device.expects("start").once().throws();
        var decoder = new decoderMod(device);
        decoder.start();
        device.verify();
    });
  });

});
