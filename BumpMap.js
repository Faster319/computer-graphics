import * as THREE from '../Common/build/three.module.js';
import { TrackballControls } from '../Common/examples/jsm/controls/TrackballControls.js';

let camera, controls, scene, renderer, canvas;


function main() {
    canvas = document.getElementById( "gl-canvas" );
    renderer = new THREE.WebGLRenderer({canvas});
    renderer.shadowMap.enabled = true;
  
    const fov = 45;
    const aspect = 2;  // the canvas default
    const near = 0.1;
    const far = 10000;
    camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(0, 10, 20);
  
    
    createControls( camera );
    controls.update();
    
    scene = new THREE.Scene();
    scene.background = new THREE.Color('lightgrey');

 
    const cubeSize = 5; 
    var cubeGeo = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
   
    const textureBrick = new THREE.TextureLoader().load('../Resources/terracotta/Bricks_Terracotta.jpg')
    var cubeMaterial = new THREE.MeshBasicMaterial({map: textureBrick});
    var cubeNoBump = new THREE.Mesh(cubeGeo, cubeMaterial);
    cubeNoBump.position.x = cubeSize;
    cubeNoBump.position.y = cubeSize/2;
    cubeNoBump.rotation.y = 1/3*Math.PI;
    scene.add(cubeNoBump);

    
    // // // //adding the bump to my material
    const bumpTexture = new THREE.TextureLoader().load('../Resources/terracotta/Bricks_Terracotta_002_height.png');

    const cubeMaterialBump = new THREE.MeshPhongMaterial({map: textureBrick, bumpMap: bumpTexture, bumpScale: 1});
    

    const cubeBump = new THREE.Mesh(cubeGeo,cubeMaterialBump);
    cubeBump.position.x = - cubeSize ;
    cubeBump.position.y = cubeSize/2;
    cubeBump.rotation.y = -1/3*Math.PI;
    scene.add(cubeBump);

    

    const textureGrass = new THREE.TextureLoader().load( '../Resources/Grass/Grass002_2K_Color.png' );
    textureGrass.wrapS = THREE.RepeatWrapping;
    textureGrass.wrapT = THREE.RepeatWrapping;
    textureGrass.repeat.set( 10, 10 );

    // immediately use the texture for material creation

    const PlaneGeometry = new THREE.PlaneGeometry( 100, 100 );
    const planeMaterial = new THREE.MeshPhongMaterial( { map: textureGrass, side: THREE.DoubleSide} );
    const plane = new THREE.Mesh( PlaneGeometry, planeMaterial );
    plane.rotateX(Math.PI/2);
    scene.add( plane );

    const ambLight = new THREE.AmbientLight( 0x404040, 1); // soft white light
    scene.add( ambLight );

    // added spotlight to enhance difference between texture and texture + normal
    var spotLight = new THREE.SpotLight( 0xffffbb, 2 );
	spotLight.position.set( 0, 20, 0 );
	scene.add( spotLight );

    spotLight.castShadow = true;

    spotLight.shadow.mapSize.width = 512;
    spotLight.shadow.mapSize.height = 512;

    spotLight.shadow.camera.near = 1;
    spotLight.shadow.camera.far = 10;

    spotLight.shadow.camera.fov = 10;

    spotLight.shadow.bias = - 0.005;

    //const lightHelper = new THREE.SpotLightHelper(spotLight);
    //scene.add(lightHelper);

   requestAnimationFrame(render);
}

function render() {

        const canvas = renderer.domElement;
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
        
        controls.update();
        
        renderer.render(scene, camera);

        requestAnimationFrame(render);
}


function createControls( camera ) {

    controls = new TrackballControls( camera, renderer.domElement );

    controls.rotateSpeed = 1.0;
    controls.zoomSpeed = 5;
    controls.panSpeed = 0.8;

    //     This array holds keycodes for controlling interactions.

// When the first defined key is pressed, all mouse interactions (left, middle, right) performs orbiting.
// When the second defined key is pressed, all mouse interactions (left, middle, right) performs zooming.
// When the third defined key is pressed, all mouse interactions (left, middle, right) performs panning.
// Default is KeyA, KeyS, KeyD which represents A, S, D.
    controls.keys = [ 'KeyA', 'KeyS', 'KeyD' ];



}

main();
