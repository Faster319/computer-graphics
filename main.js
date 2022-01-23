import * as THREE from '../Common/three/build/three.module.js';
import { PointerLockControls } from '../Common/three/examples/jsm/controls/PointerLockControls.js';
import { GLTFLoader } from '../Common/three/examples/jsm/loaders/GLTFLoader.js';
import { RoomEnvironment } from '../Common/three/examples/jsm/environments/RoomEnvironment.js';

// world variables
let camera, scene, levelOne, levelTwo, overlay, renderer, canvas, controls, detect;

// model variables
let doll, doll2, player, playerTwo

// sound variables
let deathSound, backgroundTheme;

// boolean variables
let firstPerson = true;
let moveForward = false;
let moveBackward = false;
let moveRight = false;
let moveLeft = false;
let gameOver = false;
let gameStarted = false;

let stats;

// time elapsed since the start
let prevTime = performance.now();

// used for calculating velocity and direction for movement
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();

// to write text that appears on the screen
const text = document.querySelector('.text');

/**
 * creates a delay in ms
 * setTime() calls the res function after the number of ms
 * afer the 'delay' the promise if fulfilled and function is completed
 * @example
 * // returns nothing after waiting 1000ms
 * // delay(1000);
 * @param {*} ms 
 * @returns 
 */
const delay = ms => new Promise(res => setTimeout(res, ms));


function createStats() {
  var stats = new Stats();
  stats.setMode(0);

  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0';
  stats.domElement.style.top = '0';

  return stats;
}

function main() {
  // obtains the canvas element from the HTML file which specifies the requested size of our canvas
  canvas = document.getElementById( "gl-canvas" );

  /* renderer */
  // creates the Three.js renderer and adds it to our canvas
  renderer = new THREE.WebGLRenderer({canvas});
  // sets properties of the renderer such as shadows
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(new THREE.Color(0x000000));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  // appends canvas as a child of the body in the page
  document.body.appendChild(renderer.domElement);

  // STATS  GET RID
  stats = createStats();
  document.body.appendChild(stats.domElement);

  /* world */
  // creates new Three.js scenes, one for the actual level and for the overlay before level starts
  levelOne = new THREE.Scene();
  overlay = new THREE.Scene();
  overlay.background = new THREE.Color({color: "black"});  
  // sky
  levelOne.background = new THREE.Color(0x89cff0);

  // room env
  // const environment = new RoomEnvironment();
  // const pmremGenerator = new THREE.PMREMGenerator(renderer);
  // levelOne.environment = pmremGenerator.fromScene(environment).texture;

  /* camera */
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 4500);
  camera.lookAt(50, 50, 0);

  /* player */
  // creates a player object for each level
  player = new THREE.Object3D();
  playerTwo = new THREE.Object3D();

  /* GLTFLoader */
  // allows to import models using the load() function
  const loader = new GLTFLoader();

  // loads player model
  loader.load('../GLTF_Models/player/scene.gltf', function (gltf){

    // sets castShadow = true on each child mesh, so the model can cast a shadow
    gltf.scene.traverse(function(object) {
      if (object.isMesh) {
        object.castShadow = true;
      }
    });

    // adds the model to the player object
    player.add(gltf.scene);

  }, undefined, function (error) {
    console.error(error);
  });

  // sets properties of player
  player.scale.set(30, 30, 30);
  player.position.set(0, -20, 0);
  player.rotation.set(0, Math.PI*(1/2), 0);
  // adds model to scene and camera
  levelOne.add(player);
  camera.add(player);
  // sets player model invisible
  player.visible = false;

  // creates controls using pointerlockcontrols for the player model
  controls = new PointerLockControls(player, document.body);

  // renderer.toneMapping = THREE.ACESFilmicToneMapping;
  // renderer.toneMappingExposure = 1.2;
  // renderer.outputEncoding = THREE.sRGBEncoding;

  /* sounds */
  backgroundTheme = new Audio('./Sounds/theme.mp3');
  deathSound = new Audio('./Sounds/death.mp3');
  backgroundTheme.loop = true;

  /* menu */
  const menuPanel = document.getElementById('menu');
  const level1Button = document.getElementById('level1');
  const level2Button = document.getElementById('level2');

  /* event listeners */
  // sets the scene depending on which button the user clicks
  // starts music and game
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
  // if controls are locked, the display is hidden
  controls.addEventListener('lock', function() {
    menuPanel.style.display = 'none';
  });
  // if controls are unlocked, the display is shown
  controls.addEventListener('unlock', function() {
    menuPanel.style.display = 'block';
  });

  /* doll */
  loader.load('../GLTF_Models/doll/scene.gltf', function (gltf){

    // sets properties of model
    gltf.scene.position.set(750, 0, 0);
    gltf.scene.scale.set(60, 60, 60);
    gltf.scene.rotation.set(0, -Math.PI*(1/2), 0);

    // adds model to the scene
    doll = gltf.scene;
    levelOne.add(doll);
  
    // casts shadows on each child mesh so the model can cast a shadow
    gltf.scene.traverse(function(node) {
      if (node.isMesh) {
        node.castShadow = true;
      }
    });

  }, undefined, function (error) {
    console.error(error);
  });

  /* lamp posts */
  // creates objects for the lamp post models
  const leftPost = new THREE.Object3D();
  const rightPost = new THREE.Object3D();
  loader.load('../GLTF_Models/lampost/lampost.glb', function (gltf){

    // casts shadows on each child mesh so the model can cast a shadow
    gltf.scene.traverse(function(node2) {
      if (node2.isMesh) {
        node2.castShadow = true;
      }
    });
    // adds the model and a clone to both lamp posts
    leftPost.add(gltf.scene);
    rightPost.add(gltf.scene.clone());

  }, undefined, function (error) {
    console.error(error);
  });
  // sets properties for both lamp posts and adds them to the scenes
  leftPost.position.set(-56, 0, -947);
  leftPost.scale.set(30, 30, 30);
  leftPost.rotation.set(0, -2.2, 0);
  levelOne.add(leftPost);

  rightPost.position.set(-56, 0, 947);
  rightPost.scale.set(30, 30, 30);
  rightPost.rotation.set(0, -Math.PI/4, 0);
  levelOne.add(rightPost);
  
  /* lights */
  // ambient light globally illuminates all objects in the scene equally with a white light
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  levelOne.add(ambientLight);

  // creates two yellow point lights for each lamp post
  const leftLight = new THREE.PointLight(0xffff00, 0.7);
  const rightLight = new THREE.PointLight(0xffff00, 0.7);

  // sets properties for each point light
  leftLight.position.set(128, 725, -812);
  rightLight.position.set(129, 710, 770);
  leftLight.castShadow = true;
  rightLight.castShadow = true;

  // set up shadow properties for the light
  leftLight.shadow.mapSize.width = 2048; 
  leftLight.shadow.mapSize.height = 2048; 
  leftLight.shadow.camera.near = 0.1; 
  leftLight.shadow.camera.far = 4000; 
  rightLight.shadow.mapSize.width = 2048; 
  rightLight.shadow.mapSize.height = 2048; 
  rightLight.shadow.camera.near = 0.1; 
  rightLight.shadow.camera.far = 4000;

  // adds lights to the scene
  levelOne.add(leftLight);
  levelOne.add(rightLight);

  levelOne.add(new THREE.CameraHelper(rightLight.shadow.camera));

  /* texture */
  // loads textures from resources folder
  const floorTexture = new THREE.TextureLoader().load('../Resources/floor/beach.jpg');
  const wallTexture = new THREE.TextureLoader().load('../Resources/wall/texture.png');

  // textures are repeated across the surface in the U and V direction
  wallTexture.wrapS = THREE.RepeatWrapping;
  wallTexture.wrapT = THREE.RepeatWrapping;
  wallTexture.repeat.set(3, 2);

  floorTexture.wrapS = THREE.RepeatWrapping;
  floorTexture.wrapT = THREE.RepeatWrapping;
  floorTexture.repeat.set(3, 2);

  /* floor */
  // maps loaded floor texture to the floor material
  const floorGeometry = new THREE.PlaneGeometry(3000, 2000, 100, 100);
  const floorMaterial = new THREE.MeshPhongMaterial({map: floorTexture});
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  // sets properties of floor and adds it to the scene
  floor.rotateX(-Math.PI/2);
  floor.receiveShadow = true;
  levelOne.add(floor);

  /* finish line */
  // sets properties of finish line plane and adds it to the scene
  const finishLineGeo = new THREE.PlaneGeometry(10, 2000);
  const finishLineMat = new THREE.MeshBasicMaterial({color: "red"});
  const finishLine = new THREE.Mesh(finishLineGeo, finishLineMat);
  finishLine.rotateX(-Math.PI/2);
  finishLine.position.set(740, 1, 0);
  levelOne.add(finishLine);

  /* walls */
  // maps loaded texture to the walls and makes it double sided so it appears on both sides
  const wallGeometry = new THREE.BoxGeometry(1, 2000, 2000);
  const wallMaterial = new THREE.MeshPhongMaterial({map: wallTexture, side: THREE.DoubleSide});

  // sets properties for each wall and adds each to the scene so they are set up like an arena
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
  //                                                              LEVEL 2                                                                          //
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // creates new scene for level 2
  levelTwo = new THREE.Scene();

  /* camera */
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 4500);
  camera.lookAt(50, 50, 0);

  /* sky */
  levelTwo.background = new THREE.Color(0x89cff0);

  // player
  camera.add(playerTwo);

  controls = new PointerLockControls(camera, document.body);

  /* lights */
  // ambient light globally illuminates all objects in the scene equally with a dusk light
  const ambientLightTwo = new THREE.AmbientLight(0xffffff, 0.5);
  levelTwo.add(ambientLightTwo);

  // creates two point light for each lamp post
  const leftLightTwo = new THREE.PointLight(0xECC1B2, 0.7);
  const rightLightTwo = new THREE.PointLight(0xECC1B2, 0.7);

  // sets properties for each point light
  leftLightTwo.position.set(128, 725, -812);
  rightLightTwo.position.set(129, 710, 770);
  leftLightTwo.castShadow = true;
  rightLightTwo.castShadow = true;

  // sets up shadow properties for the light
  leftLightTwo.shadow.mapSize.width = 2048; 
  leftLightTwo.shadow.mapSize.height = 2048; 
  leftLightTwo.shadow.camera.near = 0.1; 
  leftLightTwo.shadow.camera.far = 4000; 
  rightLightTwo.shadow.mapSize.width = 2048; 
  rightLightTwo.shadow.mapSize.height = 2048; 
  rightLightTwo.shadow.camera.near = 0.1; 
  rightLightTwo.shadow.camera.far = 4000;

  // adds lights to the scene
  levelTwo.add(leftLightTwo);
  levelTwo.add(rightLightTwo);

  /* floor */
  const floorTwo = new THREE.Mesh(floorGeometry, floorMaterial);
  floorTwo.rotateX(-Math.PI/2);
  floorTwo.receiveShadow = true;
  levelTwo.add(floorTwo);

  /* finish line */
  const finishLineTwo = new THREE.Mesh(finishLineGeo, finishLineMat);
  finishLineTwo.rotateX(-Math.PI/2);
  finishLineTwo.position.set(740, 1, 0);
  levelTwo.add(finishLineTwo);

  /* walls */
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

  // a new loader is created for level 2
  const loaderTwo = new GLTFLoader();
  /* player */
  loaderTwo.load('../GLTF_Models/player/scene.gltf', function (gltf){

    // adds model to player object
    playerTwo.add(gltf.scene);

  }, undefined, function (error) {
    console.error(error);
  });
  // sets properties of object and adds it to scene
  playerTwo.scale.set(30, 30, 30);
  playerTwo.position.set(0, -20, 0);
  playerTwo.rotation.set(0, Math.PI*(1/2), 0)
  levelTwo.add(playerTwo);
  playerTwo.visible = false;

  /* doll */
  loaderTwo.load('../GLTF_Models/doll/scene.gltf', function (gltf){
    
    // sets properties of doll 
    gltf.scene.position.set(750, 0, 0);
    gltf.scene.scale.set(60, 60, 60);
    gltf.scene.rotation.set(0, -Math.PI*(1/2), 0);

    doll2 = gltf.scene;

    // casts shadows ob each child mesh so the model can cast a shadow
    gltf.scene.traverse(function(node) {
      if (node.isMesh) {
        node.castShadow = true;
      }
    });

    levelTwo.add(doll2);
  }, undefined, function (error) {
    console.error(error);
  });
  /* lamp posts */
  // creates objects for the lamp post models
  const leftPostTwo = new THREE.Object3D();
  const rightPostTwo = new THREE.Object3D();
  loader.load('../GLTF_Models/lampost/lampost.glb', function (gltf){

    // casts shadows on each child mesh so the model can cast a shadow
    gltf.scene.traverse(function(node) {
      if (node.isMesh) {
        node.castShadow = true;
      }
    });
    // adds the model and a clone to both lamp posts
    leftPostTwo.add(gltf.scene);
    rightPostTwo.add(gltf.scene.clone());

  }, undefined, function (error) {
    console.error(error);
  });
  // sets properties for both lamp posts and adds them to the scenes
  leftPostTwo.position.set(-56, 0, -947);
  leftPostTwo.scale.set(30, 30, 30);
  leftPostTwo.rotation.set(0, -2.2, 0);
  levelTwo.add(leftPostTwo);

  rightPostTwo.position.set(-56, 0, 947);
  rightPostTwo.scale.set(30, 30, 30);
  rightPostTwo.rotation.set(0, -Math.PI/4, 0);
  levelTwo.add(rightPostTwo);

  /**
   * Switch statement that goes through each key press.
   * WASD will set the corresponding movement to true on pressing the key down.
   * C will set the boolean firstPerson to true or false depending on if the user is in firstPerson or not.
   * If user is in first-person, then will turn false to imply user wants to go into third-person so changes camera and sets models visibility to true.
   * @param {keyDown} event 
   */
  const onKeyDown = function(event) {
    switch (event.code) {
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
  /**
   * Similar to onKeyDown function except key C is not required.
   * For each WASD, sets the corresponding movement to false as when the user lets go of the key, the user must stop.
   * @param {keyUp} event 
   */
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
  // listen to key press events
  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('keyup', onKeyUp);

  // listen to resize events
  window.addEventListener('resize', onWindowResize);
}

/**
 * Function updates the camera aspect ratio with updateProjectionMatrix.
 * Then updates the renderer parameters and render the scene again.
 */
function onWindowResize() {
  const aspect = window.innerWidth / window.innerHeight;

  camera.aspect = aspect;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

/**
 * Returns a random number between the parameters min and max.
 * @param {*} min minimum number
 * @param {*} max maximum number
 * @returns random number between min and max
 */
function randomNumber(min, max) {
  return Math.random() * (max - min) + min;
}

/**
 * Async function that loads the game.
 * Writes text between each call to delay to signify how long before the game starts.
 * Sets gameStarted to true and calls the startGame() function.
 */
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

/**
 * Async function that runs throughout the duration of the game.
 * At the very start calls greenLight() and boolean detect is false as the player is safe so no need to check.
 * Waits a random delay between 2000 and 6000ms before the doll turns around and we call redLight() and set detect to true.
 * After doll turns around once more we call this function once more until user either loses or wins.
 */
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

/**
 * In this function we have the doll model turn to look at the player using gsap to create the animation.
 */
function redLight() {
  gsap.to(doll.rotation, {duration: .45, y: -Math.PI*(1/2)});
  gsap.to(doll2.rotation, {duration: .45, y: -Math.PI*(1/2)});
}

/**
 * In this function we have the doll model turn away from the player using gsap to create the animation.
 */
function greenLight() {
  gsap.to(doll.rotation, {duration: .45, y: Math.PI*(1/2)});
  gsap.to(doll2.rotation, {duration: .45, y: Math.PI*(1/2)});
}

/**
 * This function is called throughout the game, it checks to see if the player has won or not.
 * It also checks if the player has moved during the red light phase.
 * Checks to see if the camera/player has gone past the finish line and gameOver if false, if so they move on to the next scene.
 * If gameOver is true at any point, then the player has lost.
 * If during the redLight phase and the player still has not lost, if any movement is detected, the gameOver is set to false.
 */
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

/**
 * In this function the player model is moved in front of the camera position to give the illusion of being third person.
 */
function thirdPersonCam() {
  player.position.set(camera.position.x + 50, 0, camera.position.z);
  playerTwo.position.set(camera.position.x + 50, 0, camera.position.z);
}

/**
 * In this function the player model is moved to the exact same position as the camera.
 */
function firstPersonCam() {
  player.position.set(camera.position.x, camera.position.y, camera.position.z);
  playerTwo.position.set(camera.position.x, camera.position.y, camera.position.z);
}
 
/**
 * In this function we call the requestAnimationFrame() and the renderer.render() to allow us to swap the front and back buffer and refresh the image on screen.
 */
function animate() {
  requestAnimationFrame(animate);

  // gets the time elapsed
  const time = performance.now();

  // checks if the player is in first-person or not and then calls the corresponding function
  if (!firstPerson) {
    thirdPersonCam();
  } else {
    firstPersonCam();
  }

  // calls checker throughout
  checker();

  // if controls are locked and the game has started we calculate the movement of the player
  if (controls.isLocked === true && gameStarted) {

    // we get the delta from the time now and the time since the main function was run
    const delta = (time - prevTime) / 1000;

    // set velocity values for x and z planes
    velocity.x -= velocity.x * 10.0 * delta;
    velocity.z -= velocity.z * 10.0 * delta;
    
    // set direction values for x and z planes
    direction.z = Number(moveForward) - Number(moveBackward);
    direction.x = Number(moveRight) - Number(moveLeft);
    // this ensures consistent movements in all directions
    direction.normalize(); 

    // change velocity based on inputs
    if (moveForward || moveBackward) velocity.z -= direction.z * 1000.0 * delta;
    if (moveLeft || moveRight) velocity.x -= direction.x * 1000.0 * delta;

    // change position based on the velocity
    controls.moveRight(- velocity.x * delta);
    controls.moveForward(- velocity.z * delta);
    controls.getObject().position.y += (velocity.y * delta);

    // sets y poistions correctly if we move below the plane
    if (controls.getObject().position.y < 10) {
      velocity.y = 0;
      controls.getObject().position.y = 10;
    }
  }
  prevTime = time;

  // render the overlay first and once the game has started we render the actual scene (either level 1 or 2)
  renderer.render(overlay, camera);
  if (gameStarted) {
    //renderer.autoClear = false;
    renderer.render(scene, camera);
    stats.update();

  }
  
}

main();
animate();
