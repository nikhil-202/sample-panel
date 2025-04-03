import { GUI } from 'dat.gui';
import { EVENT_PANEL_SELECTED, EVENT_PANEL_DESELECTED } from '../constants';

export default class UIManager {
    constructor(panelManager, lightManager) {
        this.panelManager = panelManager;
        this.lightManager = lightManager;
        this.gui = null;
        this.panelFolder = null;
        this.panelTiltController = null;
        this.panelAzimuthController = null;

        this.controls = {
            sunAzimuth: 180,
            sunAltitude: 45,
            panelTilt: 0,
            panelAzimuth: 0,
            addPanelMode: false,
            removePanel: () => this.handleRemovePanel()
        };

        this.init();
        this.attachEventListeners();
    }

    init() {
        this.gui = new GUI();

        const sunFolder = this.gui.addFolder('Sun Position');
        sunFolder.add(this.controls, 'sunAzimuth', 0, 360).name('Azimuth (deg)')
            .onChange(this.handleSunChange.bind(this));
        sunFolder.add(this.controls, 'sunAltitude', 0, 90).name('Altitude (deg)')
            .onChange(this.handleSunChange.bind(this));
        sunFolder.open();

        this.panelFolder = this.gui.addFolder('Selected Panel');
        this.panelTiltController = this.panelFolder.add(this.controls, 'panelTilt', -90, 90).name('Tilt (X deg)').listen() // Label axis
            .onChange(this.handleTiltChange.bind(this));
        // --- Add Azimuth Controller ---
        this.panelAzimuthController = this.panelFolder.add(this.controls, 'panelAzimuth', 0, 360).name('Azimuth (Y deg)').listen() // Label axis
            .onChange(this.handleAzimuthChange.bind(this));
        // --- End Azimuth Controller ---
        this.panelFolder.add(this.controls, 'removePanel').name('Remove Panel');
        this.panelFolder.close();

        this.gui.add(this.controls, 'addPanelMode').name('Add Panel Mode');
        this.handleSunChange();
        console.log("UIManager initialized (dat.GUI)");
    }

    attachEventListeners() {
        this.panelManager.addEventListener(EVENT_PANEL_SELECTED, this.handlePanelSelected.bind(this));
        this.panelManager.addEventListener(EVENT_PANEL_DESELECTED, this.handlePanelDeselected.bind(this));
    }

    detachEventListeners() {
        this.panelManager.removeEventListener(EVENT_PANEL_SELECTED, this.handlePanelSelected.bind(this));
        this.panelManager.removeEventListener(EVENT_PANEL_DESELECTED, this.handlePanelDeselected.bind(this));
    }

    handleSunChange() {
        this.lightManager.updateSunPosition(this.controls.sunAzimuth, this.controls.sunAltitude);
    }

    handleTiltChange(value) {
        this.panelManager.updateSelectedPanelTilt(value);
    }

    handleAzimuthChange(value) {
        this.panelManager.updateSelectedPanelAzimuth(value);
    }

    handleRemovePanel() {
        this.panelManager.removeSelectedPanel();
    }

    handlePanelSelected(event) {
        if (event.panel) {
            const currentTilt = this.panelManager.getSelectedPanelTiltDegrees();
            const currentAzimuth = this.panelManager.getSelectedPanelAzimuthDegrees();

            this.controls.panelTilt = isNaN(currentTilt) ? 0 : currentTilt;
            this.controls.panelAzimuth = isNaN(currentAzimuth) ? 0 : currentAzimuth;

            this.panelTiltController?.updateDisplay();
            this.panelAzimuthController?.updateDisplay();

            this.panelFolder.open();
        }
        this.setAddPanelMode(false);
    }

    handlePanelDeselected(event) {
        if (this.panelFolder) {
            this.controls.panelTilt = NaN;
            this.controls.panelAzimuth = NaN;

            this.panelTiltController?.updateDisplay();
            this.panelAzimuthController?.updateDisplay();

            this.panelFolder.close();
        }
    }

    isAddPanelMode() {
        return this.controls.addPanelMode;
    }

    setAddPanelMode(isOn) {
        this.controls.addPanelMode = !!isOn;
        const controller = this.gui?.__controllers.find(c => c.property === 'addPanelMode');
        controller?.updateDisplay();
    }

    dispose() {
        this.detachEventListeners();
        if (this.gui) {
            this.gui.destroy();
            this.gui = null;
        }
        console.log("UIManager disposed (dat.GUI destroyed)");
    }
}