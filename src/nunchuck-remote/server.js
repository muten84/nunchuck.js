var device = require('../nunchuck-i2c/nunchuck');
var decoder = require('../nunchuck-decoder/decoder');
var connect = require('connect');
var createStatic = require('connect-static');
var app = connect();
var path = require('path');
var WebSocketServer = require('websocket').server;

var nunchuck = new NunchuckDevice(NUNCHUCK_ADDRESS, 10,[threshholdX,threshholdY]);

var dir = path.join(__dirname, "public");
createStatic({dir: dir}, function(err, middleware) {
  if (err) throw err;
  app.use('/', middleware);
});
var server = app.listen(8888);

// create the server
wsServer = new WebSocketServer({
    httpServer: server
});
wsServer.on('request', function(request) {
    var connection = request.accept(null, request.origin);

    connection.on('open', function(connection) {
        console.log("connection open", connection);
        nunchuck.init();
        var decoder = new NunchuckDecoder(nunchuck);
        decoder.start(function(stream){
          connection.sendUTF(decoder.asObject(stream));
        })
    });

    // This is the most important callback for us, we'll handle
    // all messages from users here.
    connection.on('message', function(message) {
        console.log(message);
        if (message.type === 'utf8') {

        }
    });

    connection.on('close', function(connection) {
        // close user connection
        console.log("connection close", connection);
        nunchuck.close();
    });
});

console.log('server started');
