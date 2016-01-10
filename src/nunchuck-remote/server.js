var NunchuckDevice = require('../nunchuck-i2c/nunchuck');
var NunchuckDecoder = require('../nunchuck-decoder/decoder');
var connect = require('connect');
var createStatic = require('connect-static');
var app = connect();
var path = require('path');
var WebSocketServer = require('websocket').server;

var nunchuck = new NunchuckDevice(0x52, 1,[]);

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

    });

    // This is the most important callback for us, we'll handle
    // all messages from users here.
    connection.on('message', function(message) {
        console.log(message);
        if (message.type === 'utf8') {
          nunchuck.init();
          console.log("nunchuck initialized....");
          var decoder = new NunchuckDecoder(nunchuck);
          console.log("decoder started....");
          decoder.start(function(stream){
            var obj = decoder.asObject(stream);
            console.log(obj);
            connection.sendUTF(JSON.stringify(obj));
          });
        }
    });

    connection.on('close', function(connection) {
        // close user connection
        console.log("connection close", connection);
        nunchuck.stop();
    });
});

console.log('server started');
