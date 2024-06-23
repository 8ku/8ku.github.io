import * as THREE from "three";

import { OrbitControls } from "./jsm/controls/OrbitControls.js";
import { GLTFLoader } from "./jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "./jsm/loaders/DRACOLoader.js";

let model, camera, scene, renderer;

init();
render();

function init() {
  const container = document.getElementById("box");
  // const canvas = document.getElementById("c");

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffffff);
  scene.fog = new THREE.Fog(0xa0a0a0, 10, 50);

  const hemiLight = new THREE.HemisphereLight(0xfefbed, 0x8d8d8d, 3);
  hemiLight.position.set(5, 20, 0);
  scene.add(hemiLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 1);
  dirLight.position.set(3, 10, 10);
  dirLight.castShadow = true;
  dirLight.shadow.camera.top = 2;
  dirLight.shadow.camera.bottom = -2;
  dirLight.shadow.camera.left = -2;
  dirLight.shadow.camera.right = 2;
  dirLight.shadow.camera.near = 0.01;
  dirLight.shadow.camera.far = 100;
  scene.add(dirLight);

  // ground

  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(100, 100),
    new THREE.MeshPhongMaterial({ color: 0xf8f8f8, depthWrite: false }),
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.receiveShadow = true;
  scene.add(mesh);

  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    1,
    100,
  );
  camera.position.set(6, 6.5, 10);

  //scene = new THREE.Scene();
  //scene.background = new THREE.Color(0xf6eedc);

  //

  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath("/assets/js/js3d/jsm/libs/draco/gltf/");

  const loader = new GLTFLoader();
  loader.setDRACOLoader(dracoLoader);
  loader.load("/assets/images/models/human_body_compress.glb", function (gltf) {
    model = gltf.scene;
    scene.add(model);
    // scene.add(gltf.scene);
    model.traverse(function (object) {
      if (object.isMesh) object.castShadow = true;
    });

    render();
  });

  //

  renderer = new THREE.WebGLRenderer({ antialias: true });
  // renderer = new THREE.WebGLRenderer({ antialias: true, canvas: canvas });
  renderer.setPixelRatio(window.devicePixelRatio);
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.shadowMap.enabled = true;
  container.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.addEventListener("change", render);
  controls.target.set(-1, 1, 0);
  controls.update();

  window.addEventListener("resize", onWindowResize);
}

function onWindowResize() {
  const container = document.getElementById("box");
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(container.clientWidth, container.clientHeight);
  // renderer.setSize(container.innerWidth, container.innerHeight);

  render();
}

function render() {
  renderer.render(scene, camera);
}
