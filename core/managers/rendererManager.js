import * as THREE from 'three';

export default class RendererManager {
    constructor(canvas) {
        if (!canvas) {
             console.error("Canvas not provided to RendererManager");
             return;
        }
        this.canvas = canvas;
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            // powerPreference: "high-performance" // or "low-power"
        });

        this.DPR = window.devicePixelRatio ? window.devicePixelRatio : 1;
        this.renderer.setPixelRatio(this.DPR);
        this.renderer.setSize(window.innerWidth, window.innerHeight); // Initial size

        // Setup Shadows
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        // Color Space and Tone Mapping
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0;

        console.log("RendererManager initialized");
    }

    render(scene, camera) {
        this.renderer.render(scene, camera);
    }

    resize(width, height) {
        this.renderer.setSize(width, height);
        console.log(`Renderer resized to ${width}x${height}`);
    }

    dispose() {
        this.renderer.dispose();
        console.log("RendererManager disposed");
    }

    get domElement() {
        return this.renderer.domElement;
    }
}