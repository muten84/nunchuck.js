var scene, camera, renderer;

var WIDTH  = window.innerWidth;
var HEIGHT = window.innerHeight;

var SPEED = 0.01;

function init() {
  scene = new THREE.Scene();

  initCube();
  initCamera();
  initRenderer();

  document.body.appendChild(renderer.domElement);
}

function initCamera() {
  camera = new THREE.PerspectiveCamera(70, WIDTH / HEIGHT, 1, 10);
  camera.position.set(0, 3.5, 5);
  camera.lookAt(scene.position);
}

function initRenderer() {
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(WIDTH, HEIGHT);
}

function initCube() {
  cube = new THREE.Mesh(new THREE.CubeGeometry(2, 2, 2), new THREE.MeshNormalMaterial());
  scene.add(cube);
}

function rotateCube() {
  cube.rotation.x -= SPEED * 2;
  cube.rotation.y -= SPEED;
  cube.rotation.z -= SPEED * 3;
}

function render() {
  requestAnimationFrame(render);
  rotateCube();
  renderer.render(scene, camera);
}

function connect() {
  // if user is running mozilla then use it's built-in WebSocket
  window.WebSocket = window.WebSocket || window.MozWebSocket;
  var connection = new WebSocket('ws://127.0.0.1:8888');
  connection.onopen = function () {
    // connection is opened and ready to use
    console.log("connection open");
  };
  connection.onerror = function (error) {
    // an error occurred when sending/receiving data
    console.log("onerror", error);
  };
  connection.onmessage = function (message) {
    // try to decode json (I assume that each message from server is json)
    try {
      var json = JSON.parse(message.data);
      console.log(json);
    } catch (e) {
      console.log('This doesn\'t look like a valid JSON: ', message.data);
      return;
    }
    // handle incoming message
  };
}

init();
render();
connect();
