import * as THREE from 'three';

import { OrbitControls } from './jsm/controls/OrbitControls.js';
import { GLTFLoader } from './jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from './jsm/loaders/DRACOLoader.js';

import Stats from './jsm/libs/stats.module.js';

let spotLight, camera, cameraTarget, scene, renderer;
let stats;

init();

function init() {

    var canvas = document.querySelector('#c');
    renderer = new THREE.WebGLRenderer({ canvas });




    camera = new THREE.PerspectiveCamera(35, 4, 1, 15);
	camera.position.set(3, 0.15, 3);
	cameraTarget = new THREE.Vector3(0, - 0.25, 0);



    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x525038);
	scene.fog = new THREE.Fog(0x525038, 1, 15);

    // Ground
    const plane = new THREE.Mesh(
        new THREE.PlaneGeometry(40, 40),
        new THREE.MeshPhongMaterial({ color: 0x929074, specular: 0x101010 })
    );
    plane.rotation.x = - Math.PI / 2;
    plane.position.y = - 0.5;
    scene.add(plane);

    plane.receiveShadow = true;

    // const grid = new THREE.GridHelper(10, 100, 0xffffff, 0xffffff);
    // grid.position.set(0,-0.6,0);
    // grid.material.opacity = 0.5;
    // grid.material.depthWrite = false;
    // grid.material.transparent = true;
    // scene.add(grid);

    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath( '/assets/js/js3d/js/libs/draco/gltf/' );

    // const loader = new GLTFLoader().setPath('../assets/images/models/');
    const loader = new GLTFLoader();
    loader.setDRACOLoader( dracoLoader );  
    loader.load('/assets/images/models/human_body_compress.glb', function (gltf) {
        const model_human = gltf.scene;

        model_human.traverse(function(node){
            if(node.isMesh){
                node.position.set( 0.9, -0.5, 0.6 );
		        node.rotation.set( 0, 0.14, 0 );
		        node.scale.set( 0.15,0.15,0.15);
                node.castShadow = true;
                node.receiveShadow = true;
            }
        });
        scene.add(model_human);

        render();
    });



    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    renderer.outputEncoding = THREE.sRGBEncoding;



    // Lights
    scene.add(new THREE.HemisphereLight(0x443333, 0x111122));

    addShadowedLight(1, 8, -0.2, 0xc6c29c, 0.7);
    addShadowedLight(0.5, 1, 1, 0xeae8f2, 0.5);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.outputEncoding = THREE.sRGBEncoding;

    renderer.shadowMap.enabled = true;
    stats = new Stats();
    canvas.appendChild(stats.dom);

    // 灯光阴影
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;



    const controls = new OrbitControls(camera, renderer.domElement);
    controls.addEventListener('change', render); // use if there is no animation loop
    controls.minDistance = 2;
    controls.maxDistance = 10;
    controls.target.set(0, 0, - 0.2);
    controls.update();

    window.addEventListener('resize', resizeRendererToDisplaySize);

    function addShadowedLight(x, y, z, color, intensity) {

        const directionalLight = new THREE.DirectionalLight(color, intensity);
        directionalLight.position.set(x, y, z);
        scene.add(directionalLight);
    
        directionalLight.castShadow = true;
    
        const d = 10;
        directionalLight.shadow.camera.left = - d;
        directionalLight.shadow.camera.right = d;
        directionalLight.shadow.camera.top = d;
        directionalLight.shadow.camera.bottom = - d;
    
        directionalLight.shadow.camera.near = 1;
        directionalLight.shadow.camera.far = 20;
    
        directionalLight.shadow.bias = - 0.002;
    
    }



    function resizeRendererToDisplaySize(renderer) {
        var canvas = renderer.domElement;
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        const needResize = canvas.width !== width || canvas.height !== height;
        if (needResize) {
            renderer.setSize(width, height, false);
        }
        return needResize;
    }

    function render() {
        if (resizeRendererToDisplaySize(renderer)) {
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }
        renderer.render(scene, camera);

    }

    render();

    // function onWindowResize() {

    //     camera.aspect = window.innerWidth / window.innerHeight;
    //     camera.updateProjectionMatrix();

    //     renderer.setSize(window.innerWidth, window.innerHeight);

    //     render();

    // }

}



