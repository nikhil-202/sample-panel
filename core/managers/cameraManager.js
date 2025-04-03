import * as THREE from 'three';
import { INITIAL_CAMERA_POS, INITIAL_TARGET_POS } from '../constants';

export default class CameraManager {
    constructor() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        this.camera = new THREE.PerspectiveCamera(
            60,           // Field of View
            width / height, // Aspect Ratio
            0.1,          // Near plane
            1000           // Far plane (Adjust based on scene scale)
        );
        this.camera.position.copy(INITIAL_CAMERA_POS);
    }

    updateAspectRatio(width, height) {
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
    }

    getCamera() {
        return this.camera;
    }
}