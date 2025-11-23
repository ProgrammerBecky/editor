import { EntityInterface } from './EntityInterface.js';
import {
	Mesh,
	BoxGeometry,
	MeshStandardMaterial,
}	from 'three';

export class EntityCube extends EntityInterface {

	editorName = '🧊 Cube';

	// Default params
	geometryParams = {
			width: 1,
			height: 1,
			depth: 1,
			widthSegments: 1,
			heightSegments: 1,
			depthSegments: 1
	};

	constructor(scene) {
			super();
			this.scene = scene;

			this.mesh = new Mesh(
				new BoxGeometry(
					this.geometryParams.width,
					this.geometryParams.height,
					this.geometryParams.depth,
					this.geometryParams.widthSegments,
					this.geometryParams.heightSegments,
					this.geometryParams.depthSegments
				),
				new MeshStandardMaterial({ color: 0x00ff00 })
			);
	}

	updateGeometry() {
			const { width, height, depth, widthSegments, heightSegments, depthSegments } = this.geometryParams;

			// Dispose old geometry to prevent memory leaks
			this.mesh.geometry.dispose();

			// Create new geometry
			this.mesh.geometry = new THREE.BoxGeometry(width, height, depth, widthSegments, heightSegments, depthSegments);
	}

	showEditorPanel() {
			const panel = document.createElement('div');

			// Add a class to the panel for styling
			panel.innerHTML = `
				<fieldset>
					<legend>Cube Size</legend>
					<label>Width: <input class="editor-input" type="number" step="0.1" value="${this.geometryParams.width}" name="width"></label><br>
					<label>Height: <input class="editor-input" type="number" step="0.1" value="${this.geometryParams.height}" name="height"></label><br>
					<label>Depth: <input class="editor-input" type="number" step="0.1" value="${this.geometryParams.depth}" name="depth"></label><br>
				</fieldset>
				<fieldset>
					<legend>Cube Geometry</legend>
					<label>Width Segments: <input class="editor-input" type="number" step="1" min="1" value="${this.geometryParams.widthSegments}" name="widthSegments"></label><br>
					<label>Height Segments: <input class="editor-input" type="number" step="1" min="1" value="${this.geometryParams.heightSegments}" name="heightSegments"></label><br>
					<label>Depth Segments: <input class="editor-input" type="number" step="1" min="1" value="${this.geometryParams.depthSegments}" name="depthSegments"></label><br>
				</fieldset>
			`;

			// Attach event listeners
			panel.querySelectorAll('input').forEach(input => {
					input.addEventListener('input', (e) => {
							const name = e.target.name;
							let value = parseFloat(e.target.value);
							if (name.includes('Segments')) value = Math.max(1, Math.floor(value)); // Segments must be integer >= 1

							this.geometryParams[name] = value;
							this.updateGeometry();
					});
			});

			return panel;
	}

}