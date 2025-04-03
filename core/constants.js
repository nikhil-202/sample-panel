import * as THREE from 'three';

export const PANEL_WIDTH = 1;
export const PANEL_HEIGHT = 0.05; // Thickness
export const PANEL_DEPTH = 1.7;
export const PANEL_COLOR = 0x202040;
export const PANEL_SELECTED_EMISSIVE = 0x0033ff;

export const GROUND_SIZE = 50;
export const GROUND_COLOR = 0x80a080;

export const FOG_COLOR = 0xabcdef;
export const FOG_NEAR = 50;
export const FOG_FAR = 200;

export const SHADOW_MAP_SIZE = 2048;
export const SHADOW_CAMERA_SIZE = 50;

export const INITIAL_CAMERA_POS = new THREE.Vector3(10, 15, 25);
export const INITIAL_TARGET_POS = new THREE.Vector3(0, 0, 0);

// Event names (optional, but good practice)
export const EVENT_PANEL_SELECTED = 'panelSelected';
export const EVENT_PANEL_DESELECTED = 'panelDeselected';