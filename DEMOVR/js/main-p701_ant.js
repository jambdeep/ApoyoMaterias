// ─────────────────────────────────────────────────────────────
// main-p701.js
// Práctica 7 – Mi primera escena VR en Quest 3 con Three.js
// Carga el modelo Room Interior de Sketchfab y lo prepara
// para visualización en modo VR con WebXR
// ─────────────────────────────────────────────────────────────

// Importamos TODA la librería Three.js desde el archivo local
import * as THREE from './three.module.min.js';

// Importamos el GLTFLoader para leer archivos .glb / .gltf
import { GLTFLoader } from './GLTFLoader.js';

// ─── DESESTRUCTURACIÓN ───────────────────────────────────────
// Sacamos las clases que vamos a usar directamente del objeto THREE
const {
    Scene,             // Contenedor principal de todos los objetos 3D
    PerspectiveCamera, // Cámara con perspectiva (como el ojo humano)
    WebGLRenderer,     // Motor que dibuja la escena usando WebGL
    AmbientLight,      // Luz que ilumina todo por igual, sin dirección
    DirectionalLight,  // Luz con dirección fija, como el sol
    Color,             // Clase para definir colores en formato hex
    Box3,              // Caja delimitadora para medir el modelo 3D
    Vector3            // Representa un punto o vector en 3D (x, y, z)
} = THREE;

// ─── VARIABLES GLOBALES ──────────────────────────────────────
let scene;      // La escena 3D (el "mundo" donde vivirán los objetos)
let renderer;   // El renderizador (quien "pinta" la escena en el canvas)
let camera;     // La cámara (el punto de vista del observador)
let roomGLTF;   // Guardará el modelo 3D del cuarto una vez que cargue

// Guardamos el tamaño inicial de la ventana del navegador
let width = window.innerWidth;
let height = window.innerHeight;

// ─── ARRANQUE ────────────────────────────────────────────────
// Llamamos a init() para preparar toda la escena
init();

// Le decimos al renderizador que ejecute "animate" en cada frame
// Usamos setAnimationLoop (no requestAnimationFrame) porque es
// el único compatible con el modo VR de WebXR
renderer.setAnimationLoop(animate);

// ─────────────────────────────────────────────────────────────
function init() {

    // ── ESCENA ──────────────────────────────────────────────────
    // Creamos el contenedor principal de la escena
    scene = new Scene();
    // Color de fondo gris oscuro (0x222222 en hexadecimal)
    scene.background = new Color(0x222222);

    // ── RENDERIZADOR ────────────────────────────────────────────
    // antialias: true → suaviza los bordes dentados
    renderer = new WebGLRenderer({ antialias: true });
    // Ajustamos el canvas al tamaño completo de la ventana
    renderer.setSize(width, height);
    // Ajustamos la densidad de píxeles (mejora nitidez en pantallas Retina)
    renderer.setPixelRatio(window.devicePixelRatio);
    // Activamos el sistema de sombras
    renderer.shadowMap.enabled = true;
    // Insertamos el canvas dentro del <body> del HTML
    document.body.appendChild(renderer.domElement);

    // ── CÁMARA ──────────────────────────────────────────────────
    // PerspectiveCamera(fov, aspect, near, far)
    // fov  = 70   → campo de visión natural para VR
    // near = 0.01 → muy cercano, evita que objetos cercanos desaparezcan
    // far  = 1000 → muy lejano, cubre modelos de cualquier escala
    camera = new PerspectiveCamera(70, width / height, 0.01, 1000);
    // Posición inicial temporal, se reajustará cuando el modelo cargue
    camera.position.set(0, 1.6, 5);
    camera.lookAt(0, 0, 0);

    // ── LUCES ───────────────────────────────────────────────────

    // Luz ambiental: ilumina todo uniformemente, sin sombras
    // 0xffffff = blanca, 1.5 = intensidad suficiente para ver el modelo
    const ambientLight = new AmbientLight(0xffffff, 1.5);
    scene.add(ambientLight);

    // Luz direccional: viene de arriba a la derecha, como el sol por una ventana
    // 0xffffff = blanca, 2.0 = intensidad fuerte
    const dirLight = new DirectionalLight(0xffffff, 2.0);
    // Posición desde donde "viene" la luz (x=5, y=8, z=5)
    dirLight.position.set(5, 8, 5);
    // Esta luz proyectará sombras sobre los objetos
    dirLight.castShadow = true;
    scene.add(dirLight);

    // ── CARGAR MODELO GLTF ──────────────────────────────────────
    // Creamos el cargador de archivos .glb / .gltf
    const gltfLoader = new GLTFLoader();

    // Iniciamos la carga — recibe 4 parámetros: ruta, éxito, progreso, error
    gltfLoader.load(

        // 1. RUTA al archivo .glb (relativa al index.html)
        '../models/room_interior/scene.gltf',

        // 2. FUNCIÓN DE ÉXITO: se ejecuta cuando el modelo termina de cargar
        (gltf) => {

            // gltf.scene es el nodo raíz que contiene todos los objetos del modelo
            roomGLTF = gltf.scene;

            // ── MEDIR EL MODELO ─────────────────────────────────
            // Box3 calcula la "caja" que envuelve al modelo completo
            const box = new Box3().setFromObject(roomGLTF);
            const size = new Vector3(); // Guardará ancho, alto y profundidad
            const center = new Vector3(); // Guardará el punto central del modelo
            box.getSize(size);            // Llena "size" con las dimensiones reales
            box.getCenter(center);        // Llena "center" con el centro geométrico

            // Mostramos en consola para depurar (F12 → pestaña Console)
            console.log('📐 Tamaño del modelo  (x, y, z):', size);
            console.log('📍 Centro del modelo  (x, y, z):', center);

            // ── ESCALA AUTOMÁTICA ────────────────────────────────
            // Calculamos cuánto mide el lado más largo del modelo
            const maxDim = Math.max(size.x, size.y, size.z);

            // Queremos que el modelo quepa en ~10 unidades de lado
            const targetSize = 10;
            const scaleFactor = targetSize / maxDim;

            // Aplicamos la misma escala en los tres ejes
            roomGLTF.scale.set(scaleFactor, scaleFactor, scaleFactor);

            // ── CENTRAR EL MODELO EN LA ESCENA ──────────────────
            // Movemos el modelo para que su centro quede en el origen (0,0,0)
            roomGLTF.position.set(
                -center.x * scaleFactor,
                -center.y * scaleFactor,
                -center.z * scaleFactor
            );

            // ── AJUSTAR CÁMARA AL TAMAÑO REAL DEL MODELO ────────
            // Calculamos las dimensiones ya escaladas
            const scaledHeight = size.y * scaleFactor; // altura real tras escalar
            const scaledDepth = size.z * scaleFactor; // profundidad real tras escalar

            // Colocamos la cámara a nivel de ojos dentro del cuarto:
            // Y = 25% de la altura total → simula estar parado dentro del cuarto
            // Z = 45% de la profundidad  → cerca de la entrada, no en el centro
            camera.position.set(
                0,
                scaledHeight * 0.18,
                scaledDepth * 0.70
            );

            // La cámara mira al frente a la misma altura (no hacia arriba ni abajo)
            // Z negativo → mira hacia el fondo del cuarto
            camera.lookAt(
                0,
                scaledHeight * 0.18,
                -scaledDepth * 0.1
            );

            // Mostramos el factor de escala aplicado en consola
            console.log('🔧 Factor de escala aplicado:', scaleFactor.toFixed(4));
            console.log('✅ Room Interior listo en escena');

            // Finalmente agregamos el modelo ya ajustado a la escena
            scene.add(roomGLTF);
        },

        // 3. FUNCIÓN DE PROGRESO: muestra el % de carga en consola
        (xhr) => {
            console.log(`⏳ Cargando: ${Math.round(xhr.loaded / xhr.total * 100)}%`);
        },

        // 4. FUNCIÓN DE ERROR: se ejecuta si algo falla al cargar
        // Causas comunes: ruta incorrecta, archivo corrupto, problema CORS
        (error) => {
            console.error('❌ Error al cargar el modelo:', error);
        }

    ); // fin de gltfLoader.load()

    // ── EVENTO DE REDIMENSIONADO ─────────────────────────────────
    // Cuando el usuario cambia el tamaño de la ventana, actualizamos todo
    window.addEventListener('resize', onWindowResize);

} // fin de init()

// ─────────────────────────────────────────────────────────────
function animate() {
    // Se ejecuta ~60 veces por segundo (cada frame)
    // Renderizamos la escena desde el punto de vista de la cámara
    renderer.render(scene, camera);
}

// ─────────────────────────────────────────────────────────────
function onWindowResize() {
    // Actualizamos las variables con el nuevo tamaño de ventana
    width = window.innerWidth;
    height = window.innerHeight;

    // Corregimos el aspecto de la cámara para evitar deformación
    camera.aspect = width / height;

    // SIEMPRE llamar esto después de cambiar propiedades de la cámara
    camera.updateProjectionMatrix();

    // Redimensionamos el canvas al nuevo tamaño
    renderer.setSize(width, height);

} // fin de onWindowResize()
