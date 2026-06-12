import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";
import { OrbitControls } from "https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://unpkg.com/three@0.160.0/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "https://unpkg.com/three@0.160.0/examples/jsm/loaders/DRACOLoader.js";

export function init(container, modelUrl) {
  const scene = new THREE.Scene();
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

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(100, 100),
    new THREE.MeshPhongMaterial({ color: 0xf8f8f8, depthWrite: false })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  const initialW = container.clientWidth  || 1;
  const initialH = container.clientHeight || 1;

  const camera = new THREE.PerspectiveCamera(60, initialW / initialH, 0.1, 100);
  camera.position.set(6, 6.5, 10);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(initialW, initialH);
  renderer.shadowMap.enabled = true;
  renderer.domElement.style.width  = "100%";
  renderer.domElement.style.height = "100%";
  renderer.domElement.style.display = "block";
  container.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(-1, 1, 0);
  controls.update();
  controls.addEventListener("change", render);

  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath("https://www.gstatic.com/draco/v1/decoders/");

  const loader = new GLTFLoader();
  loader.setDRACOLoader(dracoLoader);
  loader.load(
    modelUrl,
    (gltf) => {
      const model = gltf.scene;
      model.traverse((obj) => { if (obj.isMesh) obj.castShadow = true; });
      scene.add(model);
      render();
    },
    undefined,
    (err) => console.error("GLB load error:", err)
  );

  // resize when the stage container resizes (e.g. window resize, layout change)
  const resize = () => {
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (!w || !h) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    render();
  };
  window.addEventListener("resize", resize);
  if (typeof ResizeObserver !== "undefined") {
    new ResizeObserver(resize).observe(container);
  }

  function render() {
    renderer.render(scene, camera);
  }

  render();
}