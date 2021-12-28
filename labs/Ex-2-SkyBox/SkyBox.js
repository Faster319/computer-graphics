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
    renderer.shadowMapSoft = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    renderer.setClearColor(new THREE.Color(0x000000));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;

    const fov = 45;
    const aspect = window.innerWidth / window.innerHeight;
    const near = 0.1
    const far = 1000;

    camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.copy(new THREE.Vector3(0, 20, 40));
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    createControls(camera);

    scene = new THREE.Scene();

    //   var spotLight = new THREE.SpotLight(0xffffff);
    //   spotLight.position.copy(new THREE.Vector3(-10, 30, 40));
    //   spotLight.shadow.mapSize.width = 2048;
    //   spotLight.shadow.mapSize.height = 2048;
    //   spotLight.shadow.camera.fov = 15;
    //   spotLight.castShadow = true;
    //   spotLight.decay = 2;
    //   spotLight.penumbra = 0.05;
    //   spotLight.name = "spotLight"

    //   scene.add(spotLight);

    var ambientLight = new THREE.AmbientLight(0x343434);
    ambientLight.name = "ambientLight";
    scene.add(ambientLight);

    var urls = [
        '../Resources/clouds/east.bmp',
        '../Resources/clouds/west.bmp',
        '../Resources/clouds/up.bmp',
        '../Resources/clouds/down.bmp',
        '../Resources/clouds/north.bmp',
        '../Resources/clouds/south.bmp'
    ];

    var cubeLoader = new THREE.CubeTextureLoader();
    scene.background = cubeLoader.load(urls);

    //var cubeMaterial = new THREE.MeshStandardMaterial({
    //envMap: scene.background,
    //color: 0xffffff,
    //metalness: 1,
    //roughness: 0,
    //});

    const texture = new THREE.TextureLoader().load('../Resources/Grass/Grass002_2K_Color.png');
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1000, 1000);

    // immediately use the texture for material creation
    const material = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.DoubleSide
    });

    const geometry = new THREE.PlaneGeometry(10000, 10000);
    const plane = new THREE.Mesh(geometry, material);
    plane.rotateX(Math.PI * 0.5)
    scene.add(plane);

    //var cube = new THREE.BoxGeometry(16, 12, 12)
    //var mesh = new THREE.Mesh(cube, cubeMaterial);
    //mesh.castShadow = true;
    //mesh.position.x = -15;
    //mesh.rotation.y = -1/3*Math.PI;

    function render() {
        requestAnimationFrame(render);
        renderer.render(scene, camera);
        controls.update();
    }

    render();
}



function createControls(camera) {

    controls = new TrackballControls(camera, renderer.domElement);
    controls.rotateSpeed = 1.0;
    controls.zoomSpeed = 5;
    controls.panSpeed = 0.8;

    controls.keys = ['KeyA', 'KeyS', 'KeyD'];



}

main();