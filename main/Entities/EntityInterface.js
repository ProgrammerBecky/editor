export class EntityInterface {
	
	entityList = [];
	editorName = '❔ unnamed entity';
	
	showEditorPanel() {
		const panel = document.createElement( 'div' );
		panel.innerHTML = `
		<fieldset>
			<label>
				no configuration
			</label>
		</fieldset>`;
		return panel;
	}
	
	createBufferGeometryExplorer(maxEditable = 100) {
		const panel = document.createElement('div');
		panel.classList.add('buffer-explorer-panel');

		const geometry = this.mesh.geometry;
		if (!geometry || !geometry.isBufferGeometry) {
			panel.textContent = "No BufferGeometry available.";
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
			content.style.display = 'none'; // collapsed by default

			const array = bufferAttr.array;
			const itemSize = bufferAttr.itemSize;
			const itemCount = bufferAttr.count;
			const displayCount = Math.min(itemCount, 50); // limit for UI

			for (let i = 0; i < displayCount; i++) {
				const row = document.createElement('div');
				row.classList.add('buffer-explorer-row');

				for (let j = 0; j < itemSize; j++) {
					const index = i * itemSize + j;
					if (index >= array.length) break;

					if (array.length <= maxEditable) {
						const input = document.createElement('input');
						input.type = 'number';
						input.step = '0.01';
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
				content.style.display = content.style.display === 'none' ? 'block' : 'none';
			});

			panel.appendChild(fieldset);
		});

		return panel;
	}

}