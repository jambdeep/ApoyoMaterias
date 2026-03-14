// ─────────────────────────────────────────────────────────────
// main-p701.js
// Práctica 7 – Mi primera escena VR en Quest 3 con Three.js
// ─────────────────────────────────────────────────────────────

import * as THREE from './three.module.min.js';
import { GLTFLoader } from './GLTFLoader.js';
import { VRButton } from './VRButton.js';       // ← NUEVO: botón de entrada a VR
import { OrbitControls } from './OrbitControls.js';  // ← NUEVO: rotar con mouse

// ─── DESESTRUCTURACIÓN ───────────────────────────────────────
const {
    Scene,
    PerspectiveCamera,
    WebGLRenderer,
    AmbientLight,
    DirectionalLight,
    Color,
    Box3,
    Vector3
} = THREE;

// ─── VARIABLES GLOBALES ──────────────────────────────────────
let scene, renderer, camera;
let controls;    // OrbitControls para explorar con mouse en escritorio
let roomGLTF;

let width = window.innerWidth;
let height = window.innerHeight;

// ─── ARRANQUE ────────────────────────────────────────────────
init();
renderer.setAnimationLoop(animate);

// ─────────────────────────────────────────────────────────────
function init() {

    // ── ESCENA ──────────────────────────────────────────────────
    scene = new Scene();
    scene.background = new Color(0x222222);

    // ── RENDERIZADOR ────────────────────────────────────────────
    renderer = new WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;

    // ⚠️ CLAVE PARA VR: habilitar WebXR en el renderizador
    // Sin esta línea el botón VR no funciona aunque aparezca en pantalla
    renderer.xr.enabled = true;

    // Insertamos el canvas en el DOM
    document.body.appendChild(renderer.domElement);

    // ── VR BUTTON ───────────────────────────────────────────────
    // VRButton.createButton(renderer) genera automáticamente un botón HTML
    // que dice "ENTER VR" cuando el dispositivo soporta WebXR
    // o "VR NOT SUPPORTED" si el navegador no es compatible
    // Lo insertamos directamente en el <body> igual que el canvas
    document.body.appendChild(VRButton.createButton(renderer));

    // ── CÁMARA ──────────────────────────────────────────────────
    // fov=70, near=0.01, far=1000 → cubre cualquier escala de modelo
    camera = new PerspectiveCamera(70, width / height, 0.01, 1000);
    // Posición inicial temporal, se reajusta cuando el modelo cargue
    camera.position.set(0, 1.6, 5);
    camera.lookAt(0, 0, 0);

    // ── LUCES ───────────────────────────────────────────────────
    // Luz ambiental: ilumina todo uniformemente
    const ambientLight = new AmbientLight(0xffffff, 1.5);
    scene.add(ambientLight);

    // Luz direccional: simula el sol entrando por una ventana
    const dirLight = new DirectionalLight(0xffffff, 2.0);
    dirLight.position.set(5, 8, 5);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // ── CARGAR MODELO GLTF ──────────────────────────────────────
    const gltfLoader = new GLTFLoader();

    gltfLoader.load(
        './models/room_interior/scene.gltf',

        // CARGA EXITOSA
        (gltf) => {
            roomGLTF = gltf.scene;

            // Medimos el modelo para calcular escala y posición automáticamente
            const box = new Box3().setFromObject(roomGLTF);
            const size = new Vector3();
            const center = new Vector3();
            box.getSize(size);
            box.getCenter(center);

            console.log('📐 Tamaño del modelo (x,y,z):', size);
            console.log('📍 Centro del modelo (x,y,z):', center);

            // Escala automática: ajustamos el lado más largo a 10 unidades
            const maxDim = Math.max(size.x, size.y, size.z);
            const scaleFactor = 10 / maxDim;
            roomGLTF.scale.set(scaleFactor, scaleFactor, scaleFactor);

            // Centramos el modelo en el origen de la escena
            roomGLTF.position.set(
                -center.x * scaleFactor,
                -center.y * scaleFactor,
                -center.z * scaleFactor
            );

            // Dimensiones reales tras aplicar la escala
            const scaledHeight = size.y * scaleFactor;
            const scaledDepth = size.z * scaleFactor;

            // Cámara a nivel de ojos dentro del cuarto
            camera.position.set(
                0,
                scaledHeight * 0.18,
                scaledDepth * 0.70
            );
            camera.lookAt(
                0,
                scaledHeight * 0.18,
                -scaledDepth * 0.1
            );

            // ── ORBIT CONTROLS ──────────────────────────────────
            // Permite explorar la escena con mouse en el navegador de escritorio
            // En modo VR el Quest ignora estos controles y usa su propio tracking
            controls = new OrbitControls(camera, renderer.domElement);
            controls.enableDamping = true;   // movimiento suave con inercia
            controls.dampingFactor = 0.05;   // suavidad del movimiento
            // El punto al que orbita la cámara: centro del cuarto a altura de ojos
            controls.target.set(0, scaledHeight * 0.18, 0);
            controls.update();

            console.log('🔧 Factor de escala:', scaleFactor.toFixed(4));
            console.log('✅ Room Interior listo — presiona ENTER VR en el Quest');

            scene.add(roomGLTF);
        },

        // PROGRESO
        (xhr) => {
            console.log(`⏳ Cargando: ${Math.round(xhr.loaded / xhr.total * 100)}%`);
        },

        // ERROR
        (error) => {
            console.error('❌ Error al cargar el modelo:', error);
        }
    );

    // Escuchamos cambios de tamaño de ventana
    window.addEventListener('resize', onWindowResize);

} // fin de init()

// ─────────────────────────────────────────────────────────────
function animate() {
    // controls.update() es necesario cuando enableDamping está activo
    // Solo lo llamamos si controls ya fue inicializado (después de cargar el modelo)
    if (controls) controls.update();

    renderer.render(scene, camera);
}

// ─────────────────────────────────────────────────────────────
function onWindowResize() {
    width = window.innerWidth;
    height = window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
}
