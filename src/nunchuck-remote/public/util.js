function scale(x,min,max,a,b){
  var _1 = (b-a)*(x - min)
  var _2 = max - min;
  return (_1/_2) + a;
};

function subscribe(ip,port,callback) {
  // if user is running mozilla then use it's built-in WebSocket
  window.WebSocket = window.WebSocket || window.MozWebSocket;
  var connection = new WebSocket('ws://'+ip+':'+port);
  connection.onopen = function () {
    // connection is opened and ready to use
    console.log("connection open");
    connection.send('hello');
  };
  connection.onerror = function (error) {
    // an error occurred when sending/receiving data
    console.log("onerror", error);
  };
  connection.onmessage = function (message) {
    // try to decode json (I assume that each message from server is json)
    //console.log(message);
    try {
      var json = JSON.parse(message.data);
    } catch (e) {
      console.log('This doesn\'t look like a valid JSON: ', e);
    }
    callback(json);
    // handle incoming message
  };
}
