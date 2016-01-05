var device = require('./nunchuck-i2c/nunchuck');
var decoder = require('./nunchuck-decoder/decoder');
var nunchuck = {};
nunchuck.device = device;
nunchuck.decoder = decoder;

module.exports.nunchuck = nunchuck;
