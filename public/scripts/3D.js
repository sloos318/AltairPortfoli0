// Three.js core and the GLTF loader
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";

// Create the scene and camera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

// Set up the renderer
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById("container3D").appendChild(renderer.domElement);

// Add lights so the model is clearly visible
const ambientLight = new THREE.AmbientLight(0xffffff, 1.5); // soft overall light
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
directionalLight.position.set(3, 5, 10);
scene.add(directionalLight);

// Load the katana model
let object;
const loader = new GLTFLoader();
loader.load(
  "./images/katana3D/scene.gltf", // ✅ adjust this path to where your katana model actually is
  (gltf) => {
	object = gltf.scene;
	// --- Adjust the model’s position, rotation, and scale here ---
	object.scale.set(0.35, 0.35, 0.35); // Resize the model (try between 0.1 and 2 if it’s too small/big)
	object.position.set(0, 0, 0); // Move slightly down
	object.rotation.set(-8, -2.5, -4); // Rotate 45 degrees on Y for a nice angle
	scene.add(object);
  },
  (xhr) => console.log(`${(xhr.loaded / xhr.total) * 100}% loaded`),
  (error) => console.error("Error loading model:", error)
);

// Position the camera so the katana is in view
camera.position.z = 5; // Try between 2–10 depending on your model’s scale

// Optional: add helpers for debugging (you can remove later)
const axesHelper = new THREE.AxesHelper(2);
scene.add(axesHelper);
const gridHelper = new THREE.GridHelper(10, 10);
scene.add(gridHelper);

// Handle window resizing
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Render loop
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();
