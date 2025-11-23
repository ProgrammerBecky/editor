import { G } from '../G.js';

let currentlyDraggingEntity = null;
let placeholderLine = null;

export const addDragDropArrayHandler = (entity, headerNode, entityListRef) => {
  headerNode.setAttribute('draggable', true);

  const createPlaceholder = () => {
    const line = document.createElement('div');
    line.classList.add('scene-editor-drag-placeholder');

    const innerLine = document.createElement('div');
    innerLine.classList.add('scene-editor-drag-placeholder-line');
    line.appendChild(innerLine);

    line.style.zIndex = 1;
    return line;
  };

  headerNode.addEventListener('dragstart', (e) => {
    currentlyDraggingEntity = entity;
    headerNode.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', 'drag');
  });

  headerNode.addEventListener('dragend', () => {
    currentlyDraggingEntity = null;
    headerNode.classList.remove('dragging');
    if (placeholderLine && placeholderLine.parentNode) {
      placeholderLine.parentNode.removeChild(placeholderLine);
      placeholderLine = null;
    }
  });

  headerNode.addEventListener('dragover', (e) => {
    e.preventDefault();
    const rect = headerNode.getBoundingClientRect();
    const offsetY = e.clientY - rect.top;

    const parentContainer = headerNode.parentNode.parentNode; 
    if (!placeholderLine) {
      placeholderLine = createPlaceholder();
      parentContainer.insertBefore(
        placeholderLine,
        offsetY < rect.height / 2 ? headerNode.parentNode : headerNode.parentNode.nextSibling
      );
    } else {
      if (offsetY < rect.height / 2 && placeholderLine.nextSibling !== headerNode.parentNode) {
        parentContainer.insertBefore(placeholderLine, headerNode.parentNode);
      } else if (offsetY >= rect.height / 2 && placeholderLine.previousSibling !== headerNode.parentNode) {
        parentContainer.insertBefore(placeholderLine, headerNode.parentNode.nextSibling);
      }
    }
  });

  headerNode.addEventListener('dragleave', () => {
    if (placeholderLine && placeholderLine.parentNode) {
      placeholderLine.parentNode.removeChild(placeholderLine);
      placeholderLine = null;
    }
  });

	headerNode.addEventListener('drop', (e) => {
		e.preventDefault();
		if (!currentlyDraggingEntity || currentlyDraggingEntity === entity) return;

		// Remove the entity from any list that contains it
		const removeFromAnyList = (list) => {
			const idx = list.indexOf(currentlyDraggingEntity);
			if (idx !== -1) {
				list.splice(idx, 1);
				return true;
			}
			for (const item of list) {
				if (item.entityList && removeFromAnyList(item.entityList)) return true;
			}
			return false;
		};
		removeFromAnyList(G.entities);

		// Determine insertion index in the target list
		const parentContainer = headerNode.parentNode.parentNode;
		const entityNodes = Array.from(parentContainer.children).filter(n =>
			n.classList.contains('entity-item')
		);
		let targetIndex = entityNodes.indexOf(headerNode.parentNode);

		const rect = headerNode.getBoundingClientRect();
		const offsetY = e.clientY - rect.top;
		if (offsetY >= rect.height / 2) targetIndex += 1;

		// Insert into the target list
		entityListRef.splice(targetIndex, 0, currentlyDraggingEntity);

		if (placeholderLine && placeholderLine.parentNode) {
			placeholderLine.parentNode.removeChild(placeholderLine);
			placeholderLine = null;
		}

		const evt = new CustomEvent('entity-dropped', { bubbles: true });
		headerNode.dispatchEvent(evt);

		currentlyDraggingEntity = null;
	});
};
