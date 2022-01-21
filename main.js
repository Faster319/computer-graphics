import * as THREE from '../Common/three/build/three.module.js';
import { PointerLockControls } from '../Common/three/examples/jsm/controls/PointerLockControls.js';
import { GLTFLoader } from '../Common/three/examples/jsm/loaders/GLTFLoader.js';

let camera, scene, levelOne, levelTwo, overlay, renderer, canvas, controls, controls2, raycaster, cube, detect;

let deathSound, backgroundTheme;

let firstPerson = true;
let moveForward = false;
let moveBackward = false;
let moveRight = false;
let moveLeft = false;
let gameOver = false;
let gameStarted = false;
let doll, minionTwo, player

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
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 4500);
  //camera.lookAt(50, 50, 0);

  // player
  player = new THREE.Object3D();
  const loader = new GLTFLoader();
  levelOne = new THREE.Scene();
  loader.load('../GLTF_Models/player/scene.gltf', function (gltf){

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

  // music
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
  overlay = new THREE.Scene();
  overlay.background = new THREE.Color({color: "black"});  

  // models
  const post = new THREE.Object3D();
  const post2 = new THREE.Object3D();
  // doll
  loader.load('../GLTF_Models/doll/scene.gltf', function (gltf){
    
    gltf.scene.position.set(750, 0, 0);
    gltf.scene.scale.set(60, 60, 60);
    gltf.scene.rotation.set(0, -Math.PI*(1/2), 0);

    doll = gltf.scene;

    levelOne.add(doll);
  }, undefined, function (error) {
    console.error(error);
  });
  // lampost
  loader.load('../GLTF_Models/lampost/lampost.glb', function (gltf){

    post.add(gltf.scene);
    post2.add(gltf.scene.clone());

  }, undefined, function (error) {
    console.error(error);
  });
  // clone lamposts
  post.position.set(-85, 0, -90);
  post.scale.set(6, 6, 6);
  post.rotation.set(0, -2.2, 0);
  levelOne.add(post);

  post2.position.set(-50, 0, 0);
  post2.scale.set(6, 6, 6);
  post2.rotation.set(0, -2.2, 0);
  levelOne.add(post2);

  // sky
  levelOne.background = new THREE.Color(0x89cff0);
  
  // lights
  const dirLight = new THREE.DirectionalLight(0xffffff, 1.1);
  dirLight.position.set(0, 10, -5);
  levelOne.add(dirLight);

  const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
  levelOne.add(ambientLight);

  const spotLight = new THREE.SpotLight(0xffffff, 1);
  levelOne.add(spotLight);
  levelOne.add(spotLight.target);

  spotLight.position.set(-80, 200, -90);
  spotLight.target.position.set(0, 0, 0);

  // texture
  const floorTexture = new THREE.TextureLoader().load('../Resources/floor/beach.jpg');
  const wallTexture = new THREE.TextureLoader().load('../Resources/wall/texture.png');
  wallTexture.wrapS = THREE.RepeatWrapping;
  wallTexture.wrapT = THREE.RepeatWrapping;
  wallTexture.repeat.set(3, 2);

  // floor
  const floorGeometry = new THREE.PlaneGeometry(3000, 2000, 100, 100);
  const floorMaterial = new THREE.MeshPhongMaterial({map: floorTexture});
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotateX(-Math.PI/2);
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
  levelOne.add(leftWall);

  const rightWall = new THREE.Mesh(wallGeometry, wallMaterial);
  rightWall.rotateY(-Math.PI/2);
  rightWall.position.set(100, 0, -1000);
  levelOne.add(rightWall);

  const backWall = new THREE.Mesh(wallGeometry, wallMaterial);
  backWall.position.set(-100, 0, 0);
  levelOne.add(backWall);

  const frontWall = new THREE.Mesh(wallGeometry, wallMaterial);
  frontWall.position.set(1000, 0, 0);
  levelOne.add(frontWall);

  levelOne.add(controls.getObject());

  /////////////////////////////////////////////////
  //       Level 2                               //
  /////////////////////////////////////////////////
  levelTwo = new THREE.Scene();

  // camera
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 4500);
  camera.lookAt(50, 50, 0);

  controls = new PointerLockControls(camera, document.body);

  levelTwo.background = new THREE.Color(0x89cff0);

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
    gltf.scene.rotation.set(0, -Math.PI*(1/2), 0);

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
          player.visible = true;
          camera.position.set(camera.position.x - 20, camera.position.y + 20, camera.position.z);
        } else {
          firstPerson = true;
          player.visible = false;
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
  await delay(5000);
  text.innerText = "Starting in 3";
  await delay(1000);
  text.innerText = "Starting in 2";
  await delay(1000);
  text.innerText = "Starting in 1";
  await delay(1000);
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
  gsap.to(minionTwo.rotation, {duration: .45, y: -Math.PI*(1/2)});
  //cube.material.color.set("red");
}

function greenLight() {
  gsap.to(doll.rotation, {duration: .45, y: Math.PI*(1/2)});
  gsap.to(minionTwo.rotation, {duration: .45, y: -Math.PI*(1/2)});
  //cube.material.color.set("green");
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

function thirdPersonCam(event) {
  //camera.position.set(player.position.x - 50, player.position.y, player.position.z);
  //const camDir = camera.getWorldDirection();

  player.position.set(camera.position.x + 50, 0, camera.position.z);

  console.log('CAMERA ' + camera.position.x + ',' + camera.position.y + ',' + camera.position.z);
  console.log('PLAYER ' + player.position.x + ',' + player.position.y + ',' + player.position.z);
}

function firstPersonCam() {
  player.position.set(camera.position.x, camera.position.y, camera.position.z);
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

    // 10 first person, 100 third person

    if (firstPerson) {
      velocity.x -= velocity.x * 10.0 * delta;
      velocity.z -= velocity.z * 10.0 * delta;
    } else {
      velocity.x -= velocity.x * 10.0 * delta;
      velocity.z -= velocity.z * 10.0 * delta;
    }

    //velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

    direction.z = Number(moveForward) - Number(moveBackward);
    direction.x = Number(moveRight) - Number(moveLeft);
    direction.normalize(); // this ensures consistent movements in all directions

    // normal speed 200
    // if ((moveForward || moveBackward) && firstPerson) {
    //   velocity.z -= direction.z * 1000.0 * delta;
    // } else {
    //   velocity.z -= direction.z * 110.0 * delta;
    // }

    // if ((moveLeft || moveRight) && firstPerson) {
    //   velocity.x -= direction.x * 1000.0 * delta;
    // } else {
    //   velocity.x -= direction.x * 110.0 * delta;
    // }
    if (moveForward || moveBackward) velocity.z -= direction.z * 1000.0 * delta;
    if (moveLeft || moveRight) velocity.x -= direction.x * 1000.0 * delta;

    controls.moveRight(- velocity.x * delta);
    controls.moveForward(- velocity.z * delta);
    controls.getObject().position.y += (velocity.y * delta); // new behavior

    if (controls.getObject().position.y < 10) {
      velocity.y = 0;
      controls.getObject().position.y = 10;
    }
  
    // } else {
    //   controls2.moveRight(- velocity.x * delta);
    //   controls2.moveForward(- velocity.z * delta);
    //   controls2.getObject().position.y += (velocity.y * delta); // new behavior
  
    //   if (controls2.getObject().position.y < 10) {
    //     velocity.y = 0;
    //     controls2.getObject().position.y = 10;
    //   }
    // }

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