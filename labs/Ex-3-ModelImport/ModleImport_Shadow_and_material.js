import * as THREE from '../Common/build/three.module.js';
import {
    TrackballControls
} from '../Common/examples/jsm/controls/TrackballControls.js';

import {
    GLTFLoader
} from '../Common/examples/jsm/loaders/GLTFLoader.js';

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
    const far = 100;
    camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(0, 10, 20);


    createControls(camera);
    controls.update();

    scene = new THREE.Scene();
    scene.background = new THREE.Color('black');

    {
        const planeSize = 40;

        const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
        const planeMat = new THREE.MeshPhongMaterial({
            color: 0xADD8E6,
            side: THREE.DoubleSide,
        });
        const mesh = new THREE.Mesh(planeGeo, planeMat);
        mesh.receiveShadow = true;
        mesh.rotation.x = Math.PI * -.5;
        scene.add(mesh);
    }

    {
        const cubeSize = 4;
        const cubeGeo = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
        const cubeMat = new THREE.MeshPhongMaterial({
            color: '#8AC'
        });
        const mesh = new THREE.Mesh(cubeGeo, cubeMat);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.position.set(cubeSize + 1, cubeSize / 2, 0);
        scene.add(mesh);
    }

    {
        const cubeSize = 30;
        const cubeGeo = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
        const cubeMat = new THREE.MeshPhongMaterial({
            color: '#CCC',
            side: THREE.BackSide,
        });
        const mesh = new THREE.Mesh(cubeGeo, cubeMat);
        mesh.receiveShadow = true;
        mesh.position.set(0, cubeSize / 2 - 0.1, 0);
        scene.add(mesh);
    }

    {
        const loader = new GLTFLoader();

        loader.load('../GlTF_Models/minion_alone.glb', function(gltf) {

            gltf.scene.position.set(-6, 3, -3);
            gltf.scene.scale.set(3, 3, 3);
            gltf.scene.rotation.set(0, Math.PI * (1 / 4), 0);


            // Change HERE:
            // Adding shadows 
            gltf.scene.traverse(function(node) {
                if (node.isMesh) {
                    node.castShadow = true;
                    node.receiveShadow = true;
                }
            });

            // Change HERE:
            //changing material and material color
            var myColour = new THREE.Color(0xff00f0);
            console.log(myColour);

            gltf.scene.traverse(function(node) {
                if (node.isMesh)
                    //myColour.copy(node.material.color);
                    var newMaterial = new THREE.MeshPhongMaterial({
                        color: myColour
                    });
                node.material = newMaterial;
            });

            scene.add(gltf.scene);

        }, undefined, function(error) {

            console.error(error);

        });
    } {
        const light = new THREE.AmbientLight(0x404040, 1.2); // soft white light
        scene.add(light);
    }

    {
        const color = 0xFFFFFF;
        const intensity = 0.5;
        const light = new THREE.SpotLight(color, intensity);

        light.castShadow = true;
        light.position.set(5, 3, 4);
        scene.add(light);

        const helper = new THREE.SpotLightHelper(light);
        scene.add(helper);
    }

    function resizeRendererToDisplaySize(renderer) {
        const canvas = renderer.domElement;
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        const needResize = canvas.width !== width || canvas.height !== height;
        if (needResize) {
            renderer.setSize(width, height, false);
        }
        return needResize;
    }

    function render() {

        resizeRendererToDisplaySize(renderer);

        {
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }
        controls.update();

        renderer.render(scene, camera);

        requestAnimationFrame(render);
    }

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