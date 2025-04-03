import * as THREE from 'three';

export default class InputManager {
    constructor(cameraManager, canvas, sceneManager, panelManager, ground, uiManager) {
        this.camera = cameraManager.getCamera();
        this.canvas = canvas;
        this.sceneManager = sceneManager;
        this.panelManager = panelManager;
        this.groundMesh = ground.getMesh();
        this.uiManager = uiManager;

        this.raycaster = new THREE.Raycaster();
        this.pointer = new THREE.Vector2();

        this.boundOnPointerDown = this.onPointerDown.bind(this);
        this.init();
    }

    init() {
        this.canvas.addEventListener('pointerdown', this.boundOnPointerDown, false);
        console.log("InputManager initialized and listener attached");
    }

    onPointerDown(event) {
        // Prevent canvas click handling if clicking on GUI
        if (event.target !== this.canvas) {
             console.log("InputManager: Click ignored (not on canvas)");
             return;
        }

        // Calculate pointer position in normalized device coordinates (-1 to +1)
        this.pointer.x = (event.clientX / this.canvas.clientWidth) * 2 - 1;
        this.pointer.y = - (event.clientY / this.canvas.clientHeight) * 2 + 1;

        // Update the picking ray
        this.raycaster.setFromCamera(this.pointer, this.camera);

        const panelMeshes = this.panelManager.getPanelMeshes();
        const intersectsPanels = this.raycaster.intersectObjects(panelMeshes, false);

        if (intersectsPanels.length > 0) {
            const intersectedMesh = intersectsPanels[0].object;
            const panelGroup = this.panelManager.getPanelGroupByMesh(intersectedMesh);
            if (panelGroup) {
                this.panelManager.selectPanel(panelGroup);
                 // Turn off Add Panel mode when selecting an existing panel
                 this.uiManager.setAddPanelMode(false);
            } else {
                 console.warn("Intersected panel mesh but couldn't find corresponding group.");
                 this.panelManager.deselectPanel(); // Deselect if miss occurred
            }
            return;
        }

        if (this.uiManager.isAddPanelMode()) {
            const intersectsGround = this.raycaster.intersectObject(this.groundMesh, false);
            if (intersectsGround.length > 0) {
                const intersectPoint = intersectsGround[0].point;
                this.panelManager.createPanel(intersectPoint);
                return;
            }
        }

        this.panelManager.deselectPanel();
    }

    dispose() {
        this.canvas.removeEventListener('pointerdown', this.boundOnPointerDown, false);
        console.log("InputManager disposed, listener removed");
    }
}