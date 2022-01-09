import * as THREE from '../Common/three/build/three.module.js';
import { PointerLockControls } from '../Common/three/examples/jsm/controls/PointerLockControls.js';
import { GLTFLoader } from '../Common/three/examples/jsm/loaders/GLTFLoader.js';

let camera, scene, levelOne, levelTwo, overlay, renderer, canvas, controls, raycaster, cube, detect, rayLine;

const objects = [];

let moveForward = false;
let moveBackward = false;
let moveRight = false;
let moveLeft = false;
let gameOver = false;
let gameStarted = false;
let levelOneCompleted = false;
let minion, minionTwo;
// let canJump = false;

let prevTime = performance.now();
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();

const text = document.querySelector('.text');

const delay = ms => new Promise(res => setTimeout(res, ms));

function main() {
  canvas = document.getElementById( "gl-canvas" );

  // renderer
  renderer = new THREE.WebGLRenderer({canvas});
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  renderer.setClearColor(new THREE.Color(0x000000));
  renderer.shadowMap.enabled = true;

  const fov = 75;
  const aspect = window.innerWidth / window.innerHeight; 
  const near = 0.1;
  const far = 1500;
  camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.lookAt(50, 50, 0);

  controls = new PointerLockControls(camera, document.body);

  // menu
  const menuPanel = document.getElementById('menuPanel');
  const startButton = document.getElementById('startButton');

  startButton.addEventListener('click', function(){
    controls.lock();
    text.innerText = "Welcome to Squid Game!"
    loading();
  });

  controls.addEventListener('lock', function() {
    menuPanel.style.display = 'none';
  });

  controls.addEventListener('unlock', function() {
    menuPanel.style.display = 'block';
  });

  // world
  levelOne = new THREE.Scene();
  overlay = new THREE.Scene();
  overlay.background = new THREE.Color({color: "black"});  

  var urls = [
    '../Resources/clouds/east.bmp',
    '../Resources/clouds/west.bmp',
    '../Resources/clouds/up.bmp',
    '../Resources/clouds/down.bmp',
    '../Resources/clouds/north.bmp',
    '../Resources/clouds/south.bmp'   
  ];

  // sky
  var skyLoader = new THREE.CubeTextureLoader();
  levelOne.background = skyLoader.load(urls);
  
  // lights
  const dirLight = new THREE.DirectionalLight(0xffffff, 1.1);
  dirLight.position.set(0, 10, -5);
  levelOne.add(dirLight);

  const ambientLight = new THREE.AmbientLight(0xF22222, 2.0);
  levelOne.add(ambientLight);

  // texture
  const textureBrick = new THREE.TextureLoader().load('../Resources/terracotta/Bricks_Terracotta.jpg');
  const bumpTexture = new THREE.TextureLoader().load('../Resources/terracotta/Bricks_Terracotta_002_height.png');

  // floor
  const floorGeometry = new THREE.PlaneGeometry(3000, 2000, 100, 100);
  const floorMaterialCream = new THREE.MeshBasicMaterial({color: 0xFFFDD0});
  const floor = new THREE.Mesh(floorGeometry, floorMaterialCream);
  floor.rotateX(-Math.PI/2);
  levelOne.add(floor);

  // finishLine
  const finishLineGeo = new THREE.PlaneGeometry(10, 200);
  const finishLineMat = new THREE.MeshBasicMaterial({color: "red"});
  const finishLine = new THREE.Mesh(finishLineGeo, finishLineMat);
  finishLine.rotateX(-Math.PI/2);
  finishLine.position.set(740, 1, 0);
  levelOne.add(finishLine);

  // walls
  const wallGeometry = new THREE.BoxGeometry(1, 2000, 2000);
  const wallMaterial = new THREE.MeshPhongMaterial({map: textureBrick, bumpMap: bumpTexture, bumpScale: 5, side: THREE.DoubleSide});

  const leftWall = new THREE.Mesh(wallGeometry, wallMaterial);
  leftWall.rotateY(-Math.PI/2);
  leftWall.position.set(100, 0, 100);
  levelOne.add(leftWall);

  const rightWall = new THREE.Mesh(wallGeometry, wallMaterial);
  rightWall.rotateY(-Math.PI/2);
  rightWall.position.set(100, 0, -100);
  levelOne.add(rightWall);

  const backWall = new THREE.Mesh(wallGeometry, wallMaterial);
  backWall.position.set(-100, 0, 0);
  levelOne.add(backWall);
  objects.push(backWall);

  // cube
  const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
  const cubeMaterial = new THREE.MeshBasicMaterial({color: 0xFF0000});
  cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
  cube.position.set(1000, 0, 0);
  levelOne.add(cube);
  objects.push(cube);

  const loader = new GLTFLoader();
  loader.load('../GLTF_Models/minion_alone.glb', function (gltf){
    
    gltf.scene.position.set(750, 22, 0);
    gltf.scene.scale.set(20, 20, 20);
    gltf.scene.rotation.set(0, -Math.PI*(1/2),0);

    minion = gltf.scene;

    levelOne.add(minion);
  }, undefined, function (error) {
    console.error(error);
  });

  levelOne.add(controls.getObject());

  /////////////////////////////////////////////////
  //       Scene 2                               //
  /////////////////////////////////////////////////
  levelTwo = new THREE.Scene();

  levelTwo.background = skyLoader.load(urls);

  const floorMaterialRed = new THREE.MeshBasicMaterial({color: "red"});
  const floorTwo = new THREE.Mesh(floorGeometry, floorMaterialRed);
  floorTwo.rotateX(-Math.PI/2);
  levelTwo.add(floorTwo);

  const dirLightTwo = new THREE.DirectionalLight(0xffffff, 1.1);
  dirLightTwo.position.set(0, 10, -5);
  levelTwo.add(dirLightTwo);

  const ambientLightTwo = new THREE.AmbientLight(0xF22222, 2.0);
  levelTwo.add(ambientLightTwo);

  const finishLineTwo = new THREE.Mesh(finishLineGeo, finishLineMat);
  finishLineTwo.rotateX(-Math.PI/2);
  finishLineTwo.position.set(740, 1, 0);
  levelTwo.add(finishLineTwo);

  const leftWallTwo = new THREE.Mesh(wallGeometry, wallMaterial);
  leftWallTwo.rotateY(-Math.PI/2);
  leftWallTwo.position.set(100, 0, 100);
  levelTwo.add(leftWallTwo);

  const rightWallTwo = new THREE.Mesh(wallGeometry, wallMaterial);
  rightWallTwo.rotateY(-Math.PI/2);
  rightWallTwo.position.set(100, 0, -100);
  levelTwo.add(rightWallTwo);

  const backWallTwo = new THREE.Mesh(wallGeometry, wallMaterial);
  backWallTwo.position.set(-100, 0, 0);
  levelTwo.add(backWallTwo);

  const loaderTwo = new GLTFLoader();
  loaderTwo.load('../GLTF_Models/minion_alone.glb', function (gltf){
    
    gltf.scene.position.set(750, 22, 0);
    gltf.scene.scale.set(20, 20, 20);
    gltf.scene.rotation.set(0, -Math.PI*(1/2),0);

    minionTwo = gltf.scene;

    levelTwo.add(minionTwo);
  }, undefined, function (error) {
    console.error(error);
  });
  // levelTwo.add(controls.getObject());

  // Attach listeners to functions
  const onKeyDown = function(event) {
    switch (event.code) {
      case 'KeyW':
        moveForward = true;
        break;

      case 'KeyA':
        moveLeft = true;
        break;

      case 'KeyS':
        moveBackward = true;
        break;

      case 'KeyD':
        moveRight = true;
        break;
    }
  }

  const onKeyUp = function(event) {
    switch (event.code) {
      case 'KeyW':
        moveForward = false;
        break;

      case 'KeyA':
        moveLeft = false;
        break;

      case 'KeyS':
        moveBackward = false;
        break;

      case 'KeyD':
        moveRight = false;
        break;
    }
  }

  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('keyup', onKeyUp);

  raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, - 1, 0 ), 0, 10 );

  // set levelOne as default scene
  scene = levelOne;

  // listen to resize events
  window.addEventListener('resize', onWindowResize);
}

function onWindowResize() {
  const aspect = window.innerWidth / window.innerHeight;

  camera.aspect = aspect;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function randomNumber(min, max) {
  return Math.random() * (max - min) + min;
}

async function loading() {
  await delay(5000);
  text.innerText = "Starting in 3";
  await delay(1000);
  text.innerText = "Starting in 2";
  await delay(1000);
  text.innerText = "Starting in 1";
  await delay(1000);
  text.innerText = "Begin!!";
  gameStarted = true;
  await delay(2000);
  text.innerText = "Get to the end without Steve catching you!";
  startGame();
}

async function startGame() {
  greenLight();
  detect = false;
  await delay(randomNumber(2000, 6000));
  redLight();
  await delay(1000);
  detect = true;
  await delay(randomNumber(2000, 6000));
  startGame();
}

function redLight() {
  gsap.to(minion.rotation, {duration: .45, y: -Math.PI*(1/2)});
  cube.material.color.set("red");
}

function greenLight() {
  gsap.to(minion.rotation, {duration: .45, y: Math.PI*(1/2)})
  cube.material.color.set("green");
}

function checker() {
  if (camera.position.x > 743) {
    if (!gameOver) {
      text.innerText = "You Win!";
      levelOneCompleted = true;
      // Go to next level
      camera.position.set(0, 10, 0);
    }
  }
  //console.log(camera.position.x + ',' + camera.position.y + ',' + camera.position.z);

  if (gameOver) {
    camera.position.set(0, 10, 0);
    text.innerText = "You're dead! Restart."
  }

  if (detect && !gameOver) {
    if (moveForward || moveLeft || moveRight || moveBackward) {
      text.innerText = "You Lose!";
      gameOver = true;

      // Restart scene
      camera.position.set(0, 10, 0);
      text.innerText = "Try again!";
      return;
    }
  }
}
 
function animate() {
  requestAnimationFrame(animate);
  const time = performance.now();

  checker();

  if (levelOneCompleted) {
    scene = levelTwo;
  }

  if (controls.isLocked === true && gameStarted) {
    raycaster.ray.origin.copy(controls.getObject().position);
    raycaster.ray.origin.y -= 10;
      
    const intersections = raycaster.intersectObjects(objects, false);

    const onObject = intersections.length > 0;

    const delta = (time - prevTime) / 1000;

    velocity.x -= velocity.x * 10.0 * delta;
    velocity.z -= velocity.z * 10.0 * delta;

    velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

    direction.z = Number(moveForward) - Number(moveBackward);
    direction.x = Number(moveRight) - Number(moveLeft);
    direction.normalize(); // this ensures consistent movements in all directions

    // normal speed 200
    if (moveForward || moveBackward) velocity.z -= direction.z * 1000.0 * delta;
    if (moveLeft || moveRight) velocity.x -= direction.x * 1000.0 * delta;

    if (onObject === true) {

      velocity.y = Math.max(0, velocity.y);

    }

    controls.moveRight(- velocity.x * delta);
    controls.moveForward(- velocity.z * delta);

    controls.getObject().position.y += (velocity.y * delta); // new behavior

    if (controls.getObject().position.y < 10) {

      velocity.y = 0;
      controls.getObject().position.y = 10;
    }
  }

  prevTime = time;
  renderer.render(overlay, camera);
  if (gameStarted) {
    //renderer.autoClear = false;
    renderer.render(scene, camera);

  }

}

main();
animate();