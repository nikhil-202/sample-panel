import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Managers & World
import SceneManager from "./managers/sceneManager";
import CameraManager from "./managers/cameraManager";
import RendererManager from "./managers/rendererManager";
import LightManager from "./managers/LightManager";
import PanelManager from "./managers/panelManager";
import UIManager from "./managers/UIManager";
import InputManager from "./managers/inputManager";
import Ground from "./world/Ground";
import { INITIAL_TARGET_POS } from './constants';

export default class App {
    constructor(canvas) {
        this.canvas = canvas;
        this.animationFrameId = null;
        this.isInitialized = false;

        this.sceneManager = null;
        this.cameraManager = null;
        this.rendererManager = null;

        // Feature Managers
        this.lightManager = null;
        this.panelManager = null; // Manages panel state & creation
        this.uiManager = null;    // Manages dat.GUI
        this.inputManager = null; // Manages clicks/raycasting
        this.ground = null;       // Manages the ground plane

        // Controls
        this.orbitControls = null;

        console.log('App constructor');
    }

    init() {
        if (this.isInitialized) return;
        if (!this.canvas) {
            console.error("Canvas element not provided!");
            return;
        }
        console.log('App init starting...');


        this.sceneManager = new SceneManager();
        this.cameraManager = new CameraManager();
        this.rendererManager = new RendererManager(this.canvas);

        this.ground = new Ground(this);
        this.lightManager = new LightManager(this.sceneManager);

        this.panelManager = new PanelManager(this.sceneManager);

        this.uiManager = new UIManager(this.panelManager, this.lightManager);

        // 5. Input (needs objects to intersect with and managers to notify)
        this.inputManager = new InputManager(
            this.cameraManager,
            this.canvas,
            this.sceneManager,
            this.panelManager,
            this.ground,
            this.uiManager
        );

        this.orbitControls = new OrbitControls(this.cameraManager.getCamera(), this.rendererManager.domElement);
        this.orbitControls.enableDamping = true;
        this.orbitControls.dampingFactor = 0.05;
        this.orbitControls.target.copy(INITIAL_TARGET_POS); // Set initial lookAt target
        this.orbitControls.update(); // Initial update

        this.resize(); // Set initial size correctly
        this.animate(); // Start the loop
        this.isInitialized = true;
        console.log('App init finished successfully.');
    }

    animate() {
        this.animationFrameId = requestAnimationFrame(this.animate.bind(this));

        this.orbitControls?.update();

        this.rendererManager?.render(this.sceneManager.scene, this.cameraManager.camera);
    }

    resize() {
        if (!this.isInitialized) return;
        const width = window.innerWidth;
        const height = window.innerHeight;

        this.cameraManager?.updateAspectRatio(width, height);
        this.rendererManager?.resize(width, height);
    }

    // Cleanup method
    destroy() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }

        this.orbitControls?.dispose();
        this.inputManager?.dispose();
        this.uiManager?.dispose();
        this.panelManager?.dispose(); // Disposes panels inside
        this.lightManager?.dispose();
        this.ground?.dispose();

        this.sceneManager?.dispose();
        this.rendererManager?.dispose();

        // Clear references
        this.canvas = null;
        this.sceneManager = null;
        this.cameraManager = null;
        this.rendererManager = null;
        this.lightManager = null;
        this.panelManager = null;
        this.uiManager = null;
        this.inputManager = null;
        this.ground = null;
        this.orbitControls = null;
        this.isInitialized = false;

        console.log("App destroy finished.");
    }
}