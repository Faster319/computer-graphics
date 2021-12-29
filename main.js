import * as THREE from '../Common/three/build/three.module.js';
import * as CANNON from '../Common/cannon/build/cannon.js';
import { PointerLockControls } from '../Common/three/examples/jsm/controls/PointerLockControls.js';


let camera, controls, scene, renderer, canvas;

function main() {
  canvas = document.getElementById( "gl-canvas" );

  // renderer
  renderer = new THREE.WebGLRenderer({canvas});
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);

  renderer.setClearColor(new THREE.Color(0x000000));
  renderer.shadowMap.enabled = true;

  const fov = 75;
  const aspect = window.innerWidth / window.innerHeight; 
  const near = 0.1;
  const far = 1000;
  camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

  camera.position.y = 1;
  camera.position.z = 2;

  const controls = new PointerLockControls(camera, renderer.domElement);

  // menu
  const menuPanel = document.getElementById('menuPanel');
  const startButton = document.getElementById('startButton');

  startButton.addEventListener('click', function(){
    controls.lock();
  });

  controls.addEventListener('lock', function() {
    menuPanel.style.display = 'none';
  });

  controls.addEventListener('unlock', function() {
    menuPanel.style.display = 'block';
  });

  // world
  scene = new THREE.Scene();
  
      var spotLight = new THREE.SpotLight(0xffffff);
      spotLight.position.copy(new THREE.Vector3(-10, 30, 40));
      spotLight.shadow.mapSize.width = 2048;
      spotLight.shadow.mapSize.height = 2048;
      spotLight.shadow.camera.fov = 15;
      spotLight.castShadow = true;
      spotLight.decay = 2;
      spotLight.penumbra = 0.05;
      spotLight.name = "spotLight"

      scene.add(spotLight);

  var urls = [
    '../Resources/clouds/east.bmp',
    '../Resources/clouds/west.bmp',
    '../Resources/clouds/up.bmp',
    '../Resources/clouds/down.bmp',
    '../Resources/clouds/north.bmp',
    '../Resources/clouds/south.bmp'   
  ];

  var skyLoader = new THREE.CubeTextureLoader();
  scene.background = skyLoader.load(urls);

  const planeGeometry = new THREE.PlaneGeometry(100, 100, 50, 50);
  const planeMaterial = new THREE.MeshBasicMaterial({color: 0x00ff00});
  const plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.rotateX(-Math.PI/2);
  scene.add(plane);

  const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
  const cubeMaterial = new THREE.MeshBasicMaterial({color: 0xFF0000});
  const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
  scene.add(cube);

  // // texture
  // const texture = new THREE.TextureLoader().load('../Resources/Grass/Grass002_2K_Color.png');
  // texture.wrapS = THREE.RepeatWrapping;
  // texture.wrapT = THREE.RepeatWrapping;
  // texture.repeat.set( 1000, 1000 );

  // // immediately use the texture for material creation
  // const material = new THREE.MeshBasicMaterial( { map: texture, side: THREE.DoubleSide} );

  // const boxWidth = 1;
  // const boxHeight = 1;
  // const boxDepth = 1;
  // const cubeGeo = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);

  // const loader = new THREE.TextureLoader();

  // const geometry = new THREE.PlaneGeometry(100, 100, 50, 50);
  // const plane = new THREE.Mesh(geometry, material);
  // plane.rotateX(-Math.PI/2);
  // scene.add(plane);


  // function makeInstance(cubeGeo, color, x) {
  //   const material = new THREE.MeshPhongMaterial({color});
  //   const cube = new THREE.Mesh(cubeGeo, material);
  //   scene.add(cube);

  //   cube.position.x = x;
  // return cube;
  // }

  // const cubes = [makeInstance(cubeGeo, 0x44abc8, 0)];


  // Attach listeners to functions
  const onKeyDown = function(event) {
    switch (event.code) {
      case 'KeyW':
        controls.moveForward(0.25);
        break;

      case 'KeyA':
        controls.moveRight(-0.25);
        break;

      case 'KeyS':
        controls.moveForward(-0.25);
        break;

      case 'KeyD':
        controls.moveRight(0.25);
        break;
    }
  }

  document.addEventListener('keydown', onKeyDown, false);

  // lights
  const dirLight = new THREE.DirectionalLight(0xffffff, 1.1);
  dirLight.position.set(0, 10, -5);
  scene.add(dirLight);

  const ambientLight = new THREE.AmbientLight(0xF22222, 2.0);
  scene.add(ambientLight);

  

  // listen to resize events
  window.addEventListener('resize', onWindowResize);

  // createControls(camera);
  // controls.update;
}

// function createControls(camera) {
//   controls = new TrackballControls(camera, renderer.domElement);
  
//   controls.rotateSpeed = 1.0;
//   controls.zoomSpeed = 2;
//   controls.panSpeed = 0.8;

//   // This array holds keycodes for controlling interactions.

//   // When the first defined key is pressed, all mouse interactions (left, middle, right) performs orbiting.
//   // When the second defined key is pressed, all mouse interactions (left, middle, right) performs zooming.
//   // When the third defined key is pressed, all mouse interactions (left, middle, right) performs panning.
//   // Default is KeyA, KeyS, KeyD which represents A, S, D.
//   controls.keys = [ 'KeyA', 'KeyS', 'KeyD' ];
// }

function onWindowResize() {
  const aspect = window.innerWidth / window.innerHeight;

  camera.aspect = aspect;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
  
  // controls.handleResize();
  // controls.update();

}

function animate() {
  requestAnimationFrame(animate);

  renderer.render(scene, camera);
}

main();
animate();