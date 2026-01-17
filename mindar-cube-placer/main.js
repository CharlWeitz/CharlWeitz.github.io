import { 
    MINDAR_IMAGE_TARGET_SRC, 
    MARKER_IMAGE_URL, 
    CUBE_SIZE_AR_UNITS 
} from './constants.js';

// Import libraries via Import Map
import * as THREE from 'three';
import { MindARThree } from 'mindar-image-three';

// Compatibility Layer:
// MindAR 1.x internally might look for window.THREE or assume certain globals.
// We explicitly attach THREE to window to ensure internal compatibility.
window.THREE = THREE;

// Clear any existing Service Workers
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(function(registrations) {
        for(let registration of registrations) {
            registration.unregister();
        }
    });
}

// DOM Elements
const els = {
    splash: document.getElementById('splash-screen'),
    scanning: document.getElementById('scanning-ui'),
    running: document.getElementById('running-ui'),
    header: document.getElementById('header'),
    error: document.getElementById('error-modal'),
    help: document.getElementById('help-modal'),
    errorMsg: document.getElementById('error-msg'),
    markerImg: document.getElementById('marker-img'),
    linkMarker: document.getElementById('link-marker'),
    btnStart: document.getElementById('btn-start')
};

// Initialize Icons
if (window.lucide) {
    window.lucide.createIcons();
}

// Set Marker Images
els.markerImg.src = MARKER_IMAGE_URL;
els.linkMarker.href = MARKER_IMAGE_URL;

// State
let mindarThree = null;

// Handlers
const showError = (msg) => {
    els.errorMsg.textContent = msg;
    els.error.classList.remove('hidden');
    els.splash.classList.add('hidden');
    els.scanning.classList.add('hidden');
    els.running.classList.add('hidden');
    els.header.classList.add('hidden');
};

const showHelp = (show) => {
    if (show) els.help.classList.remove('hidden');
    else els.help.classList.add('hidden');
};

const startExperience = async () => {
    els.btnStart.textContent = "Loading...";
    els.btnStart.disabled = true;

    try {
        // 1. Permissions (iOS)
        // This is primarily for device orientation/motion sensors which might be used by MindAR or ThreeJS controls
        if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
            try {
                const state = await DeviceOrientationEvent.requestPermission();
                if (state !== 'granted') {
                    console.warn('Motion permission denied');
                }
            } catch (e) {
                console.warn("Permission request error", e);
            }
        }

        // 2. UI Updates
        els.splash.classList.add('hidden');
        els.scanning.classList.remove('hidden');
        els.header.classList.remove('hidden');

        // 3. Init AR
        await initAR();

    } catch (e) {
        console.error(e);
        showError("Initialization failed: " + (e.message || "Script Error. Check console."));
        els.btnStart.textContent = "Start AR Experience";
        els.btnStart.disabled = false;
    }
};

const initAR = async () => {
    // Initialize MindAR Three
    // Note: We disabled uiLoading and uiScanning to use our own custom UI
    // mindar-image-three exports the class MindARThree directly
    mindarThree = new MindARThree({
        container: document.getElementById('ar-container'),
        imageTargetSrc: MINDAR_IMAGE_TARGET_SRC,
        uiLoading: "no", 
        uiScanning: "no",
        uiError: "yes",
        filterMinCF: 0.0001, 
        filterBeta: 0.001,
    });

    const { renderer, scene, camera } = mindarThree;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
    dirLight.position.set(0, 5, 5);
    scene.add(dirLight);

    // Content
    const anchor = mindarThree.addAnchor(0);
    
    // Cube
    const geometry = new THREE.BoxGeometry(
        CUBE_SIZE_AR_UNITS, 
        CUBE_SIZE_AR_UNITS, 
        CUBE_SIZE_AR_UNITS
    );
    
    // Material
    const material = new THREE.MeshStandardMaterial({ 
        color: 0x00aaff,
        roughness: 0.2,
        metalness: 0.8,
        transparent: true,
        opacity: 0.9,
    });
    
    const cube = new THREE.Mesh(geometry, material);
    cube.position.y = CUBE_SIZE_AR_UNITS / 2; // Sit on top of image

    // Wireframe for better visibility
    const edges = new THREE.EdgesGeometry(geometry);
    const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0xffffff }));
    cube.add(line);

    anchor.group.add(cube);

    // Start AR Engine
    await mindarThree.start();
    
    // Switch to Running UI
    els.scanning.classList.add('hidden');
    els.running.classList.remove('hidden');

    // Render Loop
    renderer.setAnimationLoop(() => {
        if (cube) {
            cube.rotation.y += 0.01;
        }
        renderer.render(scene, camera);
    });
};

// Event Listeners
els.btnStart.addEventListener('click', startExperience);
document.getElementById('btn-help-header').addEventListener('click', () => showHelp(true));
document.getElementById('btn-help-splash').addEventListener('click', () => showHelp(true));
document.getElementById('btn-close-help').addEventListener('click', () => showHelp(false));
