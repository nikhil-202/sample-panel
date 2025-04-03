import * as THREE from 'three';
import { GROUND_SIZE } from '../constants';

export default class Ground {
    constructor(stage) {
        this.stage = stage;
        this.mesh = null;
        this.texture = null; // Keep a reference to the texture for disposal
        this.init();
    }

    init() {
        const geometry = new THREE.PlaneGeometry(GROUND_SIZE, GROUND_SIZE);

        const textureLoader = new THREE.TextureLoader();
        const imagePath = './../../public/satellite-imagery-example.png';

        try {
            this.texture = textureLoader.load(
                imagePath,
                (loadedTexture) => {
                    if (this.stage.rendererManager && this.stage.rendererManager.renderer) {
                        loadedTexture.anisotropy = this.stage.rendererManager.renderer.capabilities.getMaxAnisotropy();
                        loadedTexture.needsUpdate = true; // Ensure changes are applied
                    }
                },
                undefined,
                (error) => {
                    console.error(`Error loading ground texture from ${imagePath}:`, error);
                    // Fallback to a basic material if texture fails?
                    if (this.mesh) {
                        this.mesh.material = new THREE.MeshStandardMaterial({
                            color: 0xaaaaaa, // Fallback grey
                            roughness: 0.9,
                            metalness: 0.1
                        });
                    }
                }
            );

            // Configure texture properties immediately where possible
            this.texture.colorSpace = THREE.SRGBColorSpace; // Crucial for correct color

        } catch (error) {
            console.error("Failed to initiate texture loading:", error);
            this.texture = null; // Ensure texture is null if loading fails immediately
        }

        const material = new THREE.MeshStandardMaterial({
            map: this.texture, // Assign the texture object (even if image data isn't loaded yet)
        });

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.rotation.x = -Math.PI / 2; // Rotate flat
        this.mesh.receiveShadow = true;
        this.mesh.name = "GroundPlane";

        this.stage.sceneManager.add(this.mesh);
        console.log("Ground initialized (attempting texture) and added to scene");
    }

    getMesh() {
        return this.mesh;
    }

    dispose() {
        if (this.mesh) {
            this.mesh.geometry?.dispose();
            // Dispose the material AND the texture map
            if (this.mesh.material) {
                // Dispose texture if it exists on the material
                this.mesh.material.map?.dispose();
                this.mesh.material.dispose();
            }
            this.stage.sceneManager.remove(this.mesh);
        }
        this.mesh = null;
        this.texture = null; // Clear texture reference
    }
}