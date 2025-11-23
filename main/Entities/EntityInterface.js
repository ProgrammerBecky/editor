import {
	Vector3,
	Quaternion,
	Euler,
  MathUtils,
	Group,
} from 'three';

export class EntityInterface {
	
	entityList = [];
	editorName = '❔ Empty';
	mesh = new Group();
	
  transformParams = {
    position: new Vector3(0, 0, 0),
    rotation: new Quaternion(),
    scale: new Vector3(1, 1, 1),
    scaleLocked: false
  }
	
	constructor() {
    this.updateTransform();		
	}
	
  showEditorPanel() {
    const panel = document.createElement('div')
    panel.appendChild(this.transformEditorPanel())
    panel.appendChild(this.bufferAttributePanel())
    return panel
  }
	
	updateGeometry() {
	}
	
	updateUI() {
		window.dispatchEvent( new CustomEvent( 'update-editor-ui' ) );
	}
	
  updateTransform() {
    const t = this.transformParams
		if( this.mesh ) {
			this.mesh.position.copy(t.position)
			this.mesh.scale.copy(t.scale)
			this.mesh.quaternion.copy(t.rotation)
		}
  }
	
  transformEditorPanel() {
    const t = this.transformParams
    const euler = new Euler().setFromQuaternion(t.rotation)
    const deg = {
      x: MathUtils.radToDeg(euler.x),
      y: MathUtils.radToDeg(euler.y),
      z: MathUtils.radToDeg(euler.z)
    }

    const panel = document.createElement('div')

    panel.innerHTML = `
      <fieldset>
        <legend>Position</legend>
        <label>X: <input class="editor-input" type="text" value="${t.position.x}" name="posX"></label>
        <label>Y: <input class="editor-input" type="text" value="${t.position.y}" name="posY"></label>
        <label>Z: <input class="editor-input" type="text" value="${t.position.z}" name="posZ"></label>
      </fieldset>

      <fieldset>
        <legend>Rotation (Degrees)</legend>
        <label>X: <input class="editor-input" type="text" step="1" value="${deg.x}" name="rotX"></label>
        <label>Y: <input class="editor-input" type="text" step="1" value="${deg.y}" name="rotY"></label>
        <label>Z: <input class="editor-input" type="text" step="1" value="${deg.z}" name="rotZ"></label>
      </fieldset>

      <fieldset>
        <legend>Scale</legend>
        <label>Uniform Scale<input type="checkbox" ${t.scaleLocked ? "checked" : ""} name="scaleLocked"></label>
        <label>X: <input class="editor-input" type="text" value="${t.scale.x}" name="scaleX"></label>
        <label>Y: <input class="editor-input" type="text" value="${t.scale.y}" name="scaleY"></label>
        <label>Z: <input class="editor-input" type="text" value="${t.scale.z}" name="scaleZ"></label>
      </fieldset>
    `

    panel.querySelectorAll('input').forEach(input => {
      input.addEventListener('input', e => {
        const name = e.target.name
        const v = parseFloat(e.target.value)

        switch (name) {
          case 'posX': t.position.x = v; break
          case 'posY': t.position.y = v; break
          case 'posZ': t.position.z = v; break

          case 'rotX': deg.x = v; break
          case 'rotY': deg.y = v; break
          case 'rotZ': deg.z = v; break

          case 'scaleLocked':
            t.scaleLocked = e.target.checked
            break

          case 'scaleX':
            if (t.scaleLocked) t.scale.set(v, v, v)
            else t.scale.x = v
            break

          case 'scaleY':
            if (t.scaleLocked) t.scale.set(v, v, v)
            else t.scale.y = v
            break

          case 'scaleZ':
            if (t.scaleLocked) t.scale.set(v, v, v)
            else t.scale.z = v
            break
        }

        const newEuler = new Euler(
          MathUtils.degToRad(deg.x),
          MathUtils.degToRad(deg.y),
          MathUtils.degToRad(deg.z)
        )
        t.rotation.setFromEuler(newEuler)

        this.updateTransform()
        this.updateUI()
      })
    })

    return panel
  }	
	
	bufferAttributePanel(maxEditable = 64, maxViewable = 100) {
		const panel = document.createElement('div');
		if( ! this.mesh ) return panel;

		panel.classList.add('buffer-explorer-panel');

		const geometry = this.mesh.geometry;
		if (!geometry || !geometry.isBufferGeometry) {
			return panel;
		}

		Object.entries(geometry.attributes).forEach(([attrName, bufferAttr]) => {
			const fieldset = document.createElement('fieldset');
			fieldset.classList.add('buffer-explorer-fieldset');

			const legend = document.createElement('legend');
			legend.classList.add('buffer-explorer-legend');

			legend.textContent = `${attrName} (itemSize: ${bufferAttr.itemSize}, count: ${bufferAttr.count})`;
			fieldset.appendChild(legend);

			const content = document.createElement('div');
			content.classList.add('buffer-explorer-content');
			content.classList.add('short-list');

			// NEW: legend gets collapsed class initially
			legend.classList.add('is-collapsed');

			const array = bufferAttr.array;
			const itemSize = bufferAttr.itemSize;
			const itemCount = bufferAttr.count;
			const displayCount = Math.min(itemCount, maxViewable);

			for (let i = 0; i < displayCount; i++) {
				const row = document.createElement('div');
				row.classList.add('buffer-explorer-row');

				for (let j = 0; j < itemSize; j++) {
					const index = i * itemSize + j;
					if (index >= array.length) break;

					if (i <= maxEditable) {
						const input = document.createElement('input');
						input.type = 'text';
						input.value = array[index];
						input.classList.add('buffer-explorer-input');
						input.addEventListener('input', () => {
							array[index] = parseFloat(input.value);
							bufferAttr.needsUpdate = true;
						});
						row.appendChild(input);
					} else {
						const span = document.createElement('span');
						span.textContent = array[index].toFixed(3);
						span.classList.add('buffer-explorer-span');
						row.appendChild(span);
					}
				}

				content.appendChild(row);
			}

			if (itemCount * itemSize > displayCount * itemSize) {
				const more = document.createElement('div');
				more.textContent = '...';
				more.classList.add('buffer-explorer-more');
				content.appendChild(more);
			}

			fieldset.appendChild(content);

			legend.addEventListener('click', () => {
				if (content.classList.contains('short-list')) {
					content.classList.remove('short-list');
					legend.classList.remove('is-collapsed');
				} else {
					content.classList.add('short-list');
					legend.classList.add('is-collapsed');
				}
			});

			panel.appendChild(fieldset);
		});

		return panel;
	}

}