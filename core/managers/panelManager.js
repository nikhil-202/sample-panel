import * as THREE from 'three';
import {
    PANEL_WIDTH, PANEL_HEIGHT, PANEL_DEPTH, PANEL_COLOR, PANEL_SELECTED_EMISSIVE,
    EVENT_PANEL_SELECTED, EVENT_PANEL_DESELECTED
} from '../constants';

const Y_AXIS = new THREE.Vector3(0, 1, 0);
const X_AXIS = new THREE.Vector3(1, 0, 0); // Local X-axis for tilt

export default class PanelManager extends THREE.EventDispatcher {
    constructor(sceneManager) {
        super();
        this.sceneManager = sceneManager;
        this.panels = [];
        this.selectedPanel = null;
    }

    createPanel(position) {
        const panelGroup = new THREE.Group();

        const panelGeometry = new THREE.BoxGeometry(PANEL_WIDTH, PANEL_HEIGHT, PANEL_DEPTH);
        const panelMaterial = new THREE.MeshStandardMaterial({
            color: PANEL_COLOR,
            roughness: 0.5,
            metalness: 0.1,
            emissive: 0x000000
        });
        const panelMesh = new THREE.Mesh(panelGeometry, panelMaterial);
        panelMesh.castShadow = true;
        panelMesh.receiveShadow = false;
        panelMesh.name = "SolarPanelMesh";
        panelMesh.position.set(0, PANEL_HEIGHT / 2, 0); // Pivot at the base center

        panelGroup.add(panelMesh);
        panelGroup.position.copy(position);
        panelGroup.position.y += PANEL_DEPTH / 2; // Keep this if you want the pivot slightly above ground


        panelGroup.userData = {
            isPanelGroup: true,
            id: panelGroup.uuid,
            mesh: panelMesh,
            geometry: panelGeometry,
            material: panelMaterial,
            targetTiltDegrees: 0,
            targetAzimuthDegrees: 0,
        };

        // Initial orientation
        this._updatePanelOrientation(panelGroup); // Apply initial (0, 0) rotation

        this.sceneManager.add(panelGroup);
        this.panels.push(panelGroup);
        console.log(`Panel created: ${panelGroup.uuid} at ${position.x.toFixed(2)}, ${position.z.toFixed(2)}`);
        this.selectPanel(panelGroup);
        return panelGroup;
    }

    // --- Helper to apply combined rotation ---
    _updatePanelOrientation(panel) {
        if (!panel || !panel.userData.isPanelGroup) return;

        const targetTiltRad = THREE.MathUtils.degToRad(panel.userData.targetTiltDegrees);
        const targetAzimuthRad = THREE.MathUtils.degToRad(panel.userData.targetAzimuthDegrees);

        const azimuthQuaternion = new THREE.Quaternion().setFromAxisAngle(Y_AXIS, targetAzimuthRad);

        // Tilt rotation around the panel's local X axis
        const tiltQuaternion = new THREE.Quaternion().setFromAxisAngle(X_AXIS, targetTiltRad);

        panel.quaternion.copy(azimuthQuaternion).multiply(tiltQuaternion);

    }

    selectPanel(panelGroup) {
        if (!panelGroup || !panelGroup.userData.isPanelGroup || this.selectedPanel === panelGroup) {
            return;
        }
        this.deselectPanel();
        this.selectedPanel = panelGroup;
        console.log(`Selected panel: ${this.selectedPanel.uuid}`);
        this.selectedPanel.userData.mesh.material.emissive.setHex(PANEL_SELECTED_EMISSIVE);
        this.dispatchEvent({ type: EVENT_PANEL_SELECTED, panel: this.selectedPanel });
    }

    deselectPanel() {
        if (!this.selectedPanel) return;
        console.log(`Deselecting panel: ${this.selectedPanel.uuid}`);
        this.selectedPanel.userData.mesh.material.emissive.setHex(0x000000);
        const deselected = this.selectedPanel;
        this.selectedPanel = null;
        this.dispatchEvent({ type: EVENT_PANEL_DESELECTED, panel: deselected });
    }

    removeSelectedPanel() {
        if (!this.selectedPanel) return;
        const panelToRemove = this.selectedPanel;
        const uuid = panelToRemove.uuid;
        console.log(`Removing panel: ${uuid}`);
        this.deselectPanel(); // This also sets this.selectedPanel to null
        this.sceneManager.remove(panelToRemove);
        const index = this.panels.findIndex(p => p.uuid === uuid);
        if (index > -1) {
            this.panels.splice(index, 1);
        } else {
            console.warn(`Panel ${uuid} not found in manager array during removal.`);
        }
        panelToRemove.userData.geometry?.dispose();
        panelToRemove.userData.material?.dispose();

        // Remove mesh from parent explicitly before disposing if needed, though sceneManager.remove should handle it.
        if (panelToRemove.userData.mesh) {
             panelToRemove.remove(panelToRemove.userData.mesh); // Ensure mesh is detached from group
        }
        // Clear references
        panelToRemove.userData = {};
    }

    updateSelectedPanelTilt(tiltDegrees) {
        if (!this.selectedPanel) return;
        // Store the target value
        this.selectedPanel.userData.targetTiltDegrees = tiltDegrees;
        // Update the combined orientation
        this._updatePanelOrientation(this.selectedPanel);
    }

    getSelectedPanelTiltDegrees() {
        if (!this.selectedPanel) return NaN; // Return NaN if nothing selected
        return this.selectedPanel.userData.targetTiltDegrees;
    }

    updateSelectedPanelAzimuth(azimuthDegrees) {
        if (!this.selectedPanel) return;
        this.selectedPanel.userData.targetAzimuthDegrees = azimuthDegrees;
        this._updatePanelOrientation(this.selectedPanel);
    }

    getSelectedPanelAzimuthDegrees() {
        if (!this.selectedPanel) return NaN; // Return NaN if nothing selected
        return this.selectedPanel.userData.targetAzimuthDegrees;
    }

    getPanelGroupByMesh(mesh) {
        // Check the mesh's parent group
        if (mesh && mesh.parent && mesh.parent.userData.isPanelGroup) {
             return mesh.parent;
        }
        return this.panels.find(group => group.userData.mesh === mesh);
    }

    getPanelMeshes() {
        return this.panels.map(group => group.userData.mesh).filter(mesh => mesh);
    }

    dispose() {
        console.log("Disposing PanelManager...");
        const panelsToDispose = [...this.panels];
        panelsToDispose.forEach(panel => {
            this.selectedPanel = panel;
            this.removeSelectedPanel(); // This handles deselection, removal from scene, disposal
        });
        this.panels = []; // Clear the array
        this.selectedPanel = null; // Ensure it's null
        console.log("PanelManager disposed - all panels removed and resources released.");
    }
}