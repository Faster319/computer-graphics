import * as THREE from '../Common/three/build/three.module.js';
import { PointerLockControls } from '../Common/three/examples/jsm/controls/PointerLockControls.js';
import { GLTFLoader } from '../Common/three/examples/jsm/loaders/GLTFLoader.js';

let camera, scene, levelOne, levelTwo, overlay, renderer, canvas, controls, controls2, raycaster, cube, detect;

let deathSound, backgroundTheme;

const objects = [];

let firstPerson = true;
let moveForward = false;
let moveBackward = false;
let moveRight = false;
let moveLeft = false;
let gameOver = false;
let gameStarted = false;
let doll, player, minionTwo;

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

  // camera
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1500);
  //camera.lookAt(50, 50, 0);

  controls = new PointerLockControls(camera, document.body);

  // music
  backgroundTheme = new Audio('./Sounds/theme.mp3');
  deathSound = new Audio('./Sounds/death.mp3');
  backgroundTheme.loop = true;

  // menu
  const menuPanel = document.getElementById('menuPanel');
  const level1Button = document.getElementById('level1Button');
  const level2Button = document.getElementById('level2Button');

  level1Button.addEventListener('click', function(){
    scene = levelOne;
    controls.lock();
    text.innerText = "Welcome to Squid Game!"
    backgroundTheme.play();
    loading();
  });

  level2Button.addEventListener('click', function(){
    scene = levelTwo;
    controls.lock();
    text.innerText = "Welcome to Squid Game!"
    backgroundTheme.play();
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

  // models
  const loader = new GLTFLoader();
  loader.load('../GLTF_Models/doll/scene.gltf', function (gltf){
    
    gltf.scene.position.set(750, 0, 0);
    gltf.scene.scale.set(60, 60, 60);
    gltf.scene.rotation.set(0, -Math.PI*(1/2),0);

    doll = gltf.scene;

    levelOne.add(doll);
  }, undefined, function (error) {
    console.error(error);
  });
  // loader.load('../GLTF_Models/player/scene.gltf', function (gltf){

  //   gltf.scene.position.set(50, 10, 0);
  //   gltf.scene.scale.set(50, 50, 50);
  //   player = gltf.scene;

  //   levelOne.add(player);
  // }, undefined, function (error) {
  //   console.error(error);
  // });
  // camera.add(player);

  // cube
  const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
  const cubeMaterial = new THREE.MeshBasicMaterial({color: 0xFF0000});
  cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
  //levelOne.add(cube);
  cube.scale.set(50, 50, 50);
  levelOne.add(cube);
  objects.push(cube);

  cube.position.set(50, 10, 0);
  camera.add(cube);

  // Third person
  controls2 = new PointerLockControls(player, document.body);

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

  // const ambientLight = new THREE.AmbientLight(0xF22222, 2.0);
  // levelOne.add(ambientLight);

  const spotLight = new THREE.SpotLight(0xffffff, 0.1);
  levelOne.add(spotLight);
  levelOne.add(spotLight.target);

  spotLight.position.set(-85, 100, -90);
  spotLight.target.position.set(750, 0, 0);

  // texture
  const textureBrick = new THREE.TextureLoader().load('../Resources/terracotta/Bricks_Terracotta.jpg');
  const bumpTexture = new THREE.TextureLoader().load('../Resources/terracotta/Bricks_Terracotta_002_height.png');
  const floorTexture = new THREE.TextureLoader().load('../Resources/floor/beach.jpg');

  // floor
  const floorGeometry = new THREE.PlaneGeometry(3000, 2000, 100, 100);
  const floorMaterial = new THREE.MeshPhongMaterial({map: floorTexture});
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
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

  levelOne.add(controls.getObject());
  levelOne.add(controls2.getObject());

  /////////////////////////////////////////////////
  //       Level 2                               //
  /////////////////////////////////////////////////
  levelTwo = new THREE.Scene();

  // camera
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1500);
  camera.lookAt(50, 50, 0);

  controls = new PointerLockControls(camera, document.body);
  //controls2 = new PointerLockControls(cube, document.body);

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
  loaderTwo.load('../GLTF_Models/doll/scene.gltf', function (gltf){
    
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
  const onKeyDown = function(e) {
    switch (e.code) {
      case 'KeyC':
        if (firstPerson) {
          firstPerson = false;
        } else {
          firstPerson = true;
        }
        break;
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

  const onKeyUp = function(e) {
    switch (e.code) {
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
  gameStarted = true;
  text.innerText = "Begin!! Get to the end without Steve catching you!";
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
  gsap.to(doll.rotation, {duration: .45, y: -Math.PI*(1/2)});
  gsap.to(minionTwo.rotation, {duration: .45, y: -Math.PI*(1/2)});
  cube.material.color.set("red");
}

function greenLight() {
  gsap.to(doll.rotation, {duration: .45, y: Math.PI*(1/2)});
  gsap.to(minionTwo.rotation, {duration: .45, y: -Math.PI*(1/2)});
  cube.material.color.set("green");
}

function checker() {
  if (camera.position.x > 743) {
    if (!gameOver) {
      text.innerText = "You Win!";
      // Go to next level
      //camera.position.set(0, 10, 0);
    }
  }
  //console.log(camera.position.x + ',' + camera.position.y + ',' + camera.position.z);

  if (gameOver) {
    camera.position.set(0, 10, 0);
    text.innerText = "You're dead! Restart."
  }

  if (detect && !gameOver) {
    if (moveForward || moveLeft || moveRight || moveBackward) {
      deathSound.play();
      text.innerText = "You Lose!";
      //gameOver = true;

      // Restart scene
      //camera.position.set(0, 10, 0);
      text.innerText = "Try again!";
      //return;
    }
  }
}

function thirdPerson() {
  camera.position.set(cube.position.x - 50, cube.position.y, cube.position.z);
  console.log('CAMERA ' + camera.position.x + ',' + camera.position.y + ',' + camera.position.z);
  console.log('CUBE ' + cube.position.x + ',' + cube.position.y + ',' + cube.position.z);
}
 
function animate() {
  requestAnimationFrame(animate);
  const time = performance.now();

  if (!firstPerson) {
    thirdPerson();
  }

  checker();

  if (controls.isLocked === true && gameStarted && controls2.isLocked === true) {
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
    if (moveForward || moveBackward) velocity.z -= direction.z * 100.0 * delta;
    if (moveLeft || moveRight) velocity.x -= direction.x * 100.0 * delta;

    if (onObject === true) {
      velocity.y = Math.max(0, velocity.y);
    }

    if (firstPerson) {
      controls.moveRight(- velocity.x * delta);
      controls.moveForward(- velocity.z * delta);
      controls.getObject().position.y += (velocity.y * delta); // new behavior

      if (controls.getObject().position.y < 10) {
        velocity.y = 0;
        controls.getObject().position.y = 10;
      }
    } else {
      controls2.moveRight(- velocity.x * delta);
      controls2.moveForward(- velocity.z * delta);
      controls2.getObject().position.y += (velocity.y * delta); // new behavior
  
      if (controls2.getObject().position.y < 10) {
        velocity.y = 0;
        controls2.getObject().position.y = 10;
      }
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