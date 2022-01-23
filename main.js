import * as THREE from '../Common/three/build/three.module.js';
import { PointerLockControls } from '../Common/three/examples/jsm/controls/PointerLockControls.js';
import { GLTFLoader } from '../Common/three/examples/jsm/loaders/GLTFLoader.js';
import { RoomEnvironment } from '../Common/three/examples/jsm/environments/RoomEnvironment.js';

let camera, scene, levelOne, levelTwo, overlay, renderer, canvas, controls, raycaster, detect;

let deathSound, backgroundTheme;

let firstPerson = true;
let moveForward = false;
let moveBackward = false;
let moveRight = false;
let moveLeft = false;
let gameOver = false;
let gameStarted = false;

let doll, doll2, player, playerTwo

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
  renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap

  // world
  levelOne = new THREE.Scene();
  overlay = new THREE.Scene();
  overlay.background = new THREE.Color({color: "black"});  

  // room env
  // const environment = new RoomEnvironment();
  // const pmremGenerator = new THREE.PMREMGenerator(renderer);
  // levelOne.environment = pmremGenerator.fromScene(environment).texture;

  // camera
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 4500);
  camera.lookAt(50, 50, 0);

  // player
  player = new THREE.Object3D();
  playerTwo = new THREE.Object3D();

  const loader = new GLTFLoader();
  loader.load('../GLTF_Models/player/scene.gltf', function (gltf){

    gltf.scene.traverse(function(node) {
      if (node.isMesh) {
        node.castShadow = true;
      }
    });

    player.add(gltf.scene);

  }, undefined, function (error) {
    console.error(error);
  });
  player.scale.set(30, 30, 30);
  player.position.set(0, -20, 0);
  player.rotation.set(0, Math.PI*(1/2), 0)
  levelOne.add(player);
  camera.add(player);
  player.visible = false;

  controls = new PointerLockControls(player, document.body);

  // renderer.toneMapping = THREE.ACESFilmicToneMapping;
  // renderer.toneMappingExposure = 1.2;
  // renderer.outputEncoding = THREE.sRGBEncoding;

  // sounds
  backgroundTheme = new Audio('./Sounds/theme.mp3');
  deathSound = new Audio('./Sounds/death.mp3');
  backgroundTheme.loop = true;

  // menu
  const menuPanel = document.getElementById('menu');
  const level1Button = document.getElementById('level1');
  const level2Button = document.getElementById('level2');

  level1Button.addEventListener('click', function(){
    scene = levelOne;
    controls.lock();
    text.innerText = "Welcome to Squid Game!";
    backgroundTheme.play();
    loading();
  });

  level2Button.addEventListener('click', function(){
    scene = levelTwo;
    controls.lock();
    text.innerText = "Welcome to Squid Game!";
    backgroundTheme.play();
    loading();
  });

  controls.addEventListener('lock', function() {
    menuPanel.style.display = 'none';
  });

  controls.addEventListener('unlock', function() {
    menuPanel.style.display = 'block';
  });

  // models
  const leftPost = new THREE.Object3D();
  const rightPost = new THREE.Object3D();
  // doll
  loader.load('../GLTF_Models/doll/scene.gltf', function (gltf){

    gltf.scene.position.set(750, 0, 0);
    gltf.scene.scale.set(60, 60, 60);
    gltf.scene.rotation.set(0, -Math.PI*(1/2), 0);

    doll = gltf.scene;
    levelOne.add(doll);
    
    gltf.scene.traverse(function(node) {
      if (node.isMesh) {
        node.castShadow = true;
      }
    });

  }, undefined, function (error) {
    console.error(error);
  });
  // lampost
  loader.load('../GLTF_Models/lampost/lampost.glb', function (gltf){

    gltf.scene.traverse(function(node2) {
      if (node2.isMesh) {
        node2.castShadow = true;
      }
    });
    leftPost.add(gltf.scene);
    rightPost.add(gltf.scene.clone());

  }, undefined, function (error) {
    console.error(error);
  });
  // clone lamposts
  leftPost.position.set(-56, 0, -947);
  leftPost.scale.set(30, 30, 30);
  leftPost.rotation.set(0, -2.2, 0);
  levelOne.add(leftPost);

  rightPost.position.set(-56, 0, 947);
  rightPost.scale.set(30, 30, 30);
  rightPost.rotation.set(0, -Math.PI/4, 0);
  levelOne.add(rightPost);

  // sky
  levelOne.background = new THREE.Color(0x89cff0);
  
  // lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  levelOne.add(ambientLight);

  const leftLight = new THREE.PointLight(0xffff00, 0.7);
  const rightLight = new THREE.PointLight(0xffff00, 0.7);

  leftLight.position.set(128, 725, -812);
  rightLight.position.set(129, 710, 770);
  leftLight.castShadow = true;
  rightLight.castShadow = true;

  //Set up shadow properties for the light
  leftLight.shadow.mapSize.width = 2048; 
  leftLight.shadow.mapSize.height = 2048; 
  leftLight.shadow.camera.near = 0.1; 
  leftLight.shadow.camera.far = 4000; 
  rightLight.shadow.mapSize.width = 2048; 
  rightLight.shadow.mapSize.height = 2048; 
  rightLight.shadow.camera.near = 0.1; 
  rightLight.shadow.camera.far = 4000;

  levelOne.add(leftLight);
  levelOne.add(rightLight);

  levelOne.add(new THREE.CameraHelper(rightLight.shadow.camera));

  // texture
  const floorTexture = new THREE.TextureLoader().load('../Resources/floor/beach.jpg');
  const wallTexture = new THREE.TextureLoader().load('../Resources/wall/texture.png');
  wallTexture.wrapS = THREE.RepeatWrapping;
  wallTexture.wrapT = THREE.RepeatWrapping;
  wallTexture.repeat.set(3, 2);

  floorTexture.wrapS = THREE.RepeatWrapping;
  floorTexture.wrapT = THREE.RepeatWrapping;
  floorTexture.repeat.set(3, 2);

  // floor
  const floorGeometry = new THREE.PlaneGeometry(3000, 2000, 100, 100);
  const floorMaterial = new THREE.MeshPhongMaterial({map: floorTexture});
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotateX(-Math.PI/2);
  floor.receiveShadow = true;
  levelOne.add(floor);

  // finishLine
  const finishLineGeo = new THREE.PlaneGeometry(10, 2000);
  const finishLineMat = new THREE.MeshBasicMaterial({color: "red"});
  const finishLine = new THREE.Mesh(finishLineGeo, finishLineMat);
  finishLine.rotateX(-Math.PI/2);
  finishLine.position.set(740, 1, 0);
  levelOne.add(finishLine);

  // walls
  const wallGeometry = new THREE.BoxGeometry(1, 2000, 2000);
  const wallMaterial = new THREE.MeshPhongMaterial({map: wallTexture, side: THREE.DoubleSide});

  const leftWall = new THREE.Mesh(wallGeometry, wallMaterial);
  leftWall.rotateY(-Math.PI/2);
  leftWall.position.set(100, 0, 1000);
  leftWall.receiveShadow = true;
  levelOne.add(leftWall);

  const rightWall = new THREE.Mesh(wallGeometry, wallMaterial);
  rightWall.rotateY(-Math.PI/2);
  rightWall.position.set(100, 0, -1000);
  rightWall.receiveShadow = true;
  levelOne.add(rightWall);

  const backWall = new THREE.Mesh(wallGeometry, wallMaterial);
  backWall.position.set(-100, 0, 0);
  backWall.receiveShadow = true;
  levelOne.add(backWall);

  const frontWall = new THREE.Mesh(wallGeometry, wallMaterial);
  frontWall.position.set(1000, 0, 0);
  frontWall.receiveShadow = true;
  levelOne.add(frontWall);

  levelOne.add(controls.getObject());

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //                                                              Level 2                                                                          //
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  levelTwo = new THREE.Scene();

  // camera
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 4500);
  camera.lookAt(50, 50, 0);

  // sky
  levelTwo.background = new THREE.Color(0x89cff0);

  // player
  playerTwo.scale.set(30, 30, 30);
  playerTwo.position.set(0, -20, 0);
  playerTwo.rotation.set(0, Math.PI*(1/2), 0);

  levelTwo.add(playerTwo);
  camera.add(playerTwo);
  playerTwo.visible = false;

  controls = new PointerLockControls(camera, document.body);

  // lights
  const ambientLightTwo = new THREE.AmbientLight(0xffffff, 0.5);
  levelTwo.add(ambientLightTwo);

  const leftLightTwo = new THREE.PointLight(0xECC1B2, 0.7);
  const rightLightTwo = new THREE.PointLight(0xECC1B2, 0.7);

  leftLightTwo.position.set(128, 725, -812);
  rightLightTwo.position.set(129, 710, 770);
  leftLightTwo.castShadow = true;
  rightLightTwo.castShadow = true;

  //Set up shadow properties for the light
  leftLightTwo.shadow.mapSize.width = 2048; 
  leftLightTwo.shadow.mapSize.height = 2048; 
  leftLightTwo.shadow.camera.near = 0.1; 
  leftLightTwo.shadow.camera.far = 4000; 
  rightLightTwo.shadow.mapSize.width = 2048; 
  rightLightTwo.shadow.mapSize.height = 2048; 
  rightLightTwo.shadow.camera.near = 0.1; 
  rightLightTwo.shadow.camera.far = 4000;

  levelTwo.add(leftLightTwo);
  levelTwo.add(rightLightTwo);

  // floor
  const floorTwo = new THREE.Mesh(floorGeometry, floorMaterial);
  floorTwo.rotateX(-Math.PI/2);
  floorTwo.receiveShadow = true;
  levelTwo.add(floorTwo);

  // finish line
  const finishLineTwo = new THREE.Mesh(finishLineGeo, finishLineMat);
  finishLineTwo.rotateX(-Math.PI/2);
  finishLineTwo.position.set(740, 1, 0);
  levelTwo.add(finishLineTwo);

  // walls
  const leftWallTwo = new THREE.Mesh(wallGeometry, wallMaterial);
  leftWallTwo.rotateY(-Math.PI/2);
  leftWallTwo.position.set(100, 0, 1000);
  leftWallTwo.receiveShadow = true;
  levelTwo.add(leftWallTwo);

  const rightWallTwo = new THREE.Mesh(wallGeometry, wallMaterial);
  rightWallTwo.rotateY(-Math.PI/2);
  rightWallTwo.position.set(100, 0, -1000);
  rightWallTwo.receiveShadow = true;
  levelTwo.add(rightWallTwo);

  const backWallTwo = new THREE.Mesh(wallGeometry, wallMaterial);
  backWallTwo.position.set(-100, 0, 0);
  backWallTwo.receiveShadow = true;
  levelTwo.add(backWallTwo);

  const frontWallTwo = new THREE.Mesh(wallGeometry, wallMaterial);
  frontWallTwo.position.set(1000, 0, 0);
  frontWallTwo.receiveShadow = true;
  levelTwo.add(frontWallTwo);

  const loaderTwo = new GLTFLoader();
  // player (LEVEL 2)
  loaderTwo.load('../GLTF_Models/player/scene.gltf', function (gltf){

    playerTwo.add(gltf.scene);

  }, undefined, function (error) {
    console.error(error);
  });
  playerTwo.scale.set(30, 30, 30);
  playerTwo.position.set(0, -20, 0);
  playerTwo.rotation.set(0, Math.PI*(1/2), 0)
  levelTwo.add(playerTwo);
  //camera.add(playerTwo);
  playerTwo.visible = false;
  // doll (LEVEL 2)
  loaderTwo.load('../GLTF_Models/doll/scene.gltf', function (gltf){
    
    gltf.scene.position.set(750, 0, 0);
    gltf.scene.scale.set(60, 60, 60);
    gltf.scene.rotation.set(0, -Math.PI*(1/2), 0);

    doll2 = gltf.scene;

    gltf.scene.traverse(function(node) {
      if (node.isMesh) {
        node.castShadow = true;
      }
    });

    levelTwo.add(doll2);
  }, undefined, function (error) {
    console.error(error);
  });
  // lampost
  const leftPostTwo = new THREE.Object3D();
  const rightPostTwo = new THREE.Object3D();
  loader.load('../GLTF_Models/lampost/lampost.glb', function (gltf){

    gltf.scene.traverse(function(node) {
      if (node.isMesh) {
        node.castShadow = true;
      }
    });
    leftPostTwo.add(gltf.scene);
    rightPostTwo.add(gltf.scene.clone());

  }, undefined, function (error) {
    console.error(error);
  });
  // clone lamposts
  leftPostTwo.position.set(-56, 0, -947);
  leftPostTwo.scale.set(30, 30, 30);
  leftPostTwo.rotation.set(0, -2.2, 0);
  levelTwo.add(leftPostTwo);

  rightPostTwo.position.set(-56, 0, 947);
  rightPostTwo.scale.set(30, 30, 30);
  rightPostTwo.rotation.set(0, -Math.PI/4, 0);
  levelTwo.add(rightPostTwo);

  // levelTwo.add(controls.getObject());

  // Attach listeners to functions
  const onKeyDown = function(e) {
    switch (e.code) {
      case 'KeyC':
        if (firstPerson) {
          firstPerson = false;
          player.visible = true;
          playerTwo.visible = true;
          camera.position.set(camera.position.x - 20, camera.position.y + 20, camera.position.z);
        } else {
          firstPerson = true;
          player.visible = false;
          playerTwo.visible = false;
          camera.position.set(camera.position.x + 20, camera.position.y - 20, camera.position.z);
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
  //await delay(5000);
  text.innerText = "Starting in 3...";
  //await delay(1000);
  text.innerText = "Starting in 2...";
  //await delay(1000);
  text.innerText = "Starting in 1...";
  //await delay(1000);
  gameStarted = true;
  text.innerText = "Begin!! Get to the end without the doll catching you!";
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
  gsap.to(doll2.rotation, {duration: .45, y: -Math.PI*(1/2)});
}

function greenLight() {
  gsap.to(doll.rotation, {duration: .45, y: Math.PI*(1/2)});
  gsap.to(doll2.rotation, {duration: .45, y: Math.PI*(1/2)});
}

function checker() {
  if (camera.position.x > 743) {
    if (!gameOver) {
      text.innerText = "You Win!";
      scene.clear();
      scene = levelTwo;
      // Go to next level
      camera.position.set(0, 10, 0);
    }
  }

  if (gameOver) {
    camera.position.set(0, 10, 0);
    text.innerText = "You're dead! Restart."
  }
  console.log('CAMERA ' + camera.position.x + ',' + camera.position.y + ',' + camera.position.z);

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

function thirdPersonCam() {
  player.position.set(camera.position.x + 50, 0, camera.position.z);
  playerTwo.position.set(camera.position.x + 50, 0, camera.position.z);

  console.log('CAMERA ' + camera.position.x + ',' + camera.position.y + ',' + camera.position.z);
  console.log('PLAYER ' + player.position.x + ',' + player.position.y + ',' + player.position.z);
}

function firstPersonCam() {
  player.position.set(camera.position.x, camera.position.y, camera.position.z);
  playerTwo.position.set(camera.position.x, camera.position.y, camera.position.z);
}
 
function animate() {
  requestAnimationFrame(animate);
  const time = performance.now();

  if (!firstPerson) {
    thirdPersonCam();
  } else {
    firstPersonCam();
  }

  checker();

  if (controls.isLocked === true && gameStarted) {

    const delta = (time - prevTime) / 1000;

    velocity.x -= velocity.x * 10.0 * delta;
    velocity.z -= velocity.z * 10.0 * delta;
    
    direction.z = Number(moveForward) - Number(moveBackward);
    direction.x = Number(moveRight) - Number(moveLeft);
    direction.normalize(); // this ensures consistent movements in all directions

    if (moveForward || moveBackward) velocity.z -= direction.z * 10000.0 * delta;
    if (moveLeft || moveRight) velocity.x -= direction.x * 10000.0 * delta;

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