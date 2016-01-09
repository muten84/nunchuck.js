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
  cube = new THREE.Mesh(new THREE.CubeGeometry(3, 3, 3), new THREE.MeshNormalMaterial());
  scene.add(cube);
}

function rotateCube(x,y,z) {

  var xAxis = new THREE.Vector3(1,1,0);
  rotateAroundWorldAxis(cube,x,y,z);
}

function render(x,y,z) {
  //requestAnimationFrame(render);
  rotateCube(x,y,z);
  renderer.render(scene, camera);
}

// Rotate an object around an arbitrary axis in object space
var rotObjectMatrix;
function rotateAroundObjectAxis(object, axis, radians) {
    rotObjectMatrix = new THREE.Matrix4();
    rotObjectMatrix.makeRotationAxis(axis.normalize(), radians);

    // old code for Three.JS pre r54:
    // object.matrix.multiplySelf(rotObjectMatrix);      // post-multiply
    // new code for Three.JS r55+:
    object.matrix.multiply(rotObjectMatrix);

    // old code for Three.js pre r49:
    // object.rotation.getRotationFromMatrix(object.matrix, object.scale);
    // old code for Three.js r50-r58:
    // object.rotation.setEulerFromRotationMatrix(object.matrix);
    // new code for Three.js r59+:
    object.rotation.setFromRotationMatrix(object.matrix);
}

var rotWorldMatrix;
// Rotate an object around an arbitrary axis in world space
function rotateAroundWorldAxis(object,x,y,z) {
    var m = new THREE.Matrix4();

    var m1 = new THREE.Matrix4();
    var m2 = new THREE.Matrix4();
    var m3 = new THREE.Matrix4();
    //rotWorldMatrix.makeRotationAxis(axis.normalize(), radians);
    m1.makeRotationX(y);
    m2.makeRotationY(x);
    m3.makeRotationZ(z);

    // old code for Three.JS pre r54:
    //  rotWorldMatrix.multiply(object.matrix);
    // new code for Three.JS r55+:
    //rotWorldMatrix.multiply(object.matrix);                // pre-multiply

    m.multiplyMatrices( m1, m2 );
    m.multiply( m3 );
    //m.multiply(object.matrix);

    object.matrix = m;

    // old code for Three.js pre r49:
    // object.rotation.getRotationFromMatrix(object.matrix, object.scale);
    // old code for Three.js pre r59:
    // object.rotation.setEulerFromRotationMatrix(object.matrix);
    // code for r59+:
    object.rotation.setFromRotationMatrix(object.matrix);
}

function connect() {
  // if user is running mozilla then use it's built-in WebSocket
  window.WebSocket = window.WebSocket || window.MozWebSocket;
  var connection = new WebSocket('ws://192.168.1.164:8888');
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
      var r = json.rotation;
      //console.log(json);
    } catch (e) {
      console.log('This doesn\'t look like a valid JSON: ', message.data);
      return;
    }

    try {
      render(r.x,r.y,r.z);
    }
    catch (err) {
      console.log('Error while rendering', err);
      return;
    }
    // handle incoming message
  };
}

init();
//render();
connect();
