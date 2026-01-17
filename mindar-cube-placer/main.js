import { 
    MINDAR_IMAGE_TARGET_SRC, 
    MARKER_IMAGE_URL, 
    CUBE_SIZE_AR_UNITS 
} from './constants.js';

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
    linkMarker: document.getElementById('link-marker')
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
    if (window.arLibsFailed) {
        showError("Failed to load AR libraries. Check your internet connection or ad blockers.");
        return;
    }

    if (!window.THREE) {
        showError("Three.js library is missing.");
        return;
    }

    if (!window.MINDAR) {
        showError("MindAR library is missing.");
        return;
    }

    // 1. Permissions (iOS)
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        try {
            const state = await DeviceOrientationEvent.requestPermission();
            if (state !== 'granted') {
                console.warn('Motion permission denied');
            }
        } catch (e) {
            console.warn(e);
        }
    }

    // 2. UI Updates
    els.splash.classList.add('hidden');
    els.scanning.classList.remove('hidden');
    els.header.classList.remove('hidden');

    // 3. Init AR
    initAR();
};

const initAR = async () => {
    try {
        const { THREE, MINDAR } = window;

        mindarThree = new MINDAR.IMAGE.MindARThree({
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
        const material = new THREE.MeshStandardMaterial({ 
            color: 0x00aaff,
            roughness: 0.2,
            metalness: 0.8,
            transparent: true,
            opacity: 0.9,
        });
        const cube = new THREE.Mesh(geometry, material);
        cube.position.y = CUBE_SIZE_AR_UNITS / 2; // Sit on top of image

        // Wireframe
        const edges = new THREE.EdgesGeometry(geometry);
        const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0xffffff }));
        cube.add(line);

        anchor.group.add(cube);

        // Start
        await mindarThree.start();
        
        // Success State
        els.scanning.classList.add('hidden');
        els.running.classList.remove('hidden');

        // Render Loop
        renderer.setAnimationLoop(() => {
            cube.rotation.y += 0.01;
            cube.rotation.x += 0.005;
            renderer.render(scene, camera);
        });

    } catch (e) {
        console.error(e);
        showError("Failed to start AR. " + (e.message || "Ensure camera permissions are allowed."));
    }
};

// Event Listeners
document.getElementById('btn-start').addEventListener('click', startExperience);
document.getElementById('btn-help-header').addEventListener('click', () => showHelp(true));
document.getElementById('btn-help-splash').addEventListener('click', () => showHelp(true));
document.getElementById('btn-close-help').addEventListener('click', () => showHelp(false));
