import * as THREE from 'three';
import { SHADOW_MAP_SIZE, SHADOW_CAMERA_SIZE } from '../constants';

export default class LightManager {
    constructor(sceneManager) {
        this.sceneManager = sceneManager;
        this.sunLight = null;
        this.ambientLight = null;
        this.init();
    }

    init() {
        // Ambient Light
        this.ambientLight = new THREE.AmbientLight(0xffffff, 1);
        this.sceneManager.add(this.ambientLight);

        // Directional Light (Sun)
        this.sunLight = new THREE.DirectionalLight(0xffffff, 1.0);
        this.sunLight.castShadow = true;
        this.sunLight.position.set(0, 100, 0); // Initial default position
        this.sunLight.target.position.set(0, 0, 0);

        // Shadow configuration
        this.sunLight.shadow.mapSize.width = SHADOW_MAP_SIZE * 2;
        this.sunLight.shadow.mapSize.height = SHADOW_MAP_SIZE * 2;
        this.sunLight.shadow.camera.near = 0.5;
        this.sunLight.shadow.camera.far = 200; // Adjust based on scene size & light distance
        this.sunLight.shadow.camera.left = -SHADOW_CAMERA_SIZE * 0.5;
        this.sunLight.shadow.camera.right = SHADOW_CAMERA_SIZE * 0.5;
        this.sunLight.shadow.camera.top = SHADOW_CAMERA_SIZE * 0.5;
        this.sunLight.shadow.camera.bottom = -SHADOW_CAMERA_SIZE * 0.5;
        this.sunLight.shadow.bias = -0.0005; // Prevent shadow acne
        this.sunLight.shadow.radius= 3;
        this.sunLight.shadow.blurSamples= 8;

        this.sceneManager.add(this.sunLight);
        this.sceneManager.add(this.sunLight.target); // Target needs to be in the scene

        console.log("LightManager initialized (Ambient + Sun)");
    }

    updateSunPosition(azimuthDeg, altitudeDeg) {
        if (!this.sunLight) return;

        const azimuthRad = THREE.MathUtils.degToRad(azimuthDeg);
        const altitudeRad = THREE.MathUtils.degToRad(altitudeDeg);
        const distance = 100; // Keep light far away for parallel rays

        // Calculate position using spherical coordinates (Y-up)
        this.sunLight.position.x = distance * Math.cos(altitudeRad) * Math.sin(azimuthRad);
        this.sunLight.position.y = distance * Math.sin(altitudeRad);
        this.sunLight.position.z = distance * Math.cos(altitudeRad) * Math.cos(azimuthRad);

        // Ensure target is updated if it ever moves (though unlikely here)
        this.sunLight.target.updateMatrixWorld();
    }

    dispose() {
        // Lights don't have dispose methods, just remove them
        if (this.ambientLight) this.sceneManager.remove(this.ambientLight);
        if (this.sunLight) {
            this.sceneManager.remove(this.sunLight.target);
            this.sceneManager.remove(this.sunLight);
        }
        console.log("LightManager lights removed from scene");
    }
}