var device = require('./src/nunchuck-i2c/nunchuck');
var decoder = require('./src/nunchuck-decoder/decoder');
var nunchuck = {};
nunchuck.device = device;
nunchuck.decoder = decoder;

module.exports.nunchuck = nunchuck;
