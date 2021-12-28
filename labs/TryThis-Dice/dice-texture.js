import * as THREE from '../Common/build/three.module.js';
import {
    TrackballControls
} from '../Common/examples/jsm/controls/TrackballControls.js';

let camera, controls, scene, renderer, canvas;


function main() {
    canvas = document.getElementById("gl-canvas");
    renderer = new THREE.WebGLRenderer({
        canvas
    });
    renderer.shadowMap.enabled = true;

    const fov = 45;
    const aspect = 2; // the canvas default
    const near = 0.1;
    const far = 10000;
    camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(0, 10, 20);


    createControls(camera);
    controls.update();

    scene = new THREE.Scene();
    scene.background = new THREE.Color('black');


    const texture = new THREE.TextureLoader().load('../Resources/Grass/Grass002_2K_Color.png');
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1000, 1000);

    // immediately use the texture for material creation
    const material = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.DoubleSide
    });

    const cubeSize = 2;
    var cubeGeo = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);

    const loader = new THREE.TextureLoader();

    // change code here >> adding for loop to load dice faces
    var materials = []
    var resources_path = '../Resources/cube/';
    for (var i = 1; i < 7; i++) {
        var img_path = 'CubeUV_' + i + '.jpg';
        var full_img_path = resources_path + img_path;
        var img = loader.load(full_img_path)
        var mat = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            map: img
        });
        materials.push(mat);
    }


    const cubeMesh = new THREE.Mesh(cubeGeo, materials);
    cubeMesh.position.y = cubeSize / 2;
    cubeMesh.rotation.set(0, -Math.PI * (3 / 4), 0);


    //cubeMesh.castShadow = true;
    //cubeMesh.receiveShadow = true;
    scene.add(cubeMesh);


    const geometry = new THREE.PlaneGeometry(10000, 10000);
    const plane = new THREE.Mesh(geometry, material);
    plane.rotateX(Math.PI / 2);
    scene.add(plane);

    const ambLight = new THREE.AmbientLight(0x404040, 10); // soft white light
    scene.add(ambLight);

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


function createControls(camera) {

    controls = new TrackballControls(camera, renderer.domElement);

    controls.rotateSpeed = 1.0;
    controls.zoomSpeed = 5;
    controls.panSpeed = 0.8;

    //     This array holds keycodes for controlling interactions.

    // When the first defined key is pressed, all mouse interactions (left, middle, right) performs orbiting.
    // When the second defined key is pressed, all mouse interactions (left, middle, right) performs zooming.
    // When the third defined key is pressed, all mouse interactions (left, middle, right) performs panning.
    // Default is KeyA, KeyS, KeyD which represents A, S, D.
    controls.keys = ['KeyA', 'KeyS', 'KeyD'];



}

main();