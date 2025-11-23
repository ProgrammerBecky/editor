import { G } from '../G.js';

let currentlyDraggingEntity = null;
let placeholderLine = null;

export const addDragDropArrayHandler = (entity, headerNode) => {
  headerNode.setAttribute('draggable', true);

	const createPlaceholder = () => {
		const line = document.createElement('div');
		line.classList.add('scene-editor-drag-placeholder');

		const innerLine = document.createElement('div');
		innerLine.classList.add('scene-editor-drag-placeholder-line');
		line.appendChild(innerLine);

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

    const parent = headerNode.parentNode.parentNode; // container of entity-items
    if (!placeholderLine) {
      placeholderLine = createPlaceholder();
      parent.insertBefore(
        placeholderLine,
        offsetY < rect.height / 2 ? headerNode.parentNode : headerNode.parentNode.nextSibling
      );
    } else {
      if (offsetY < rect.height / 2 && placeholderLine.nextSibling !== headerNode.parentNode) {
        parent.insertBefore(placeholderLine, headerNode.parentNode);
      } else if (offsetY >= rect.height / 2 && placeholderLine.previousSibling !== headerNode.parentNode) {
        parent.insertBefore(placeholderLine, headerNode.parentNode.nextSibling);
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

    const parentContainer = headerNode.parentNode.parentNode;
    const entityNodes = Array.from(parentContainer.children).filter(n =>
      n.classList.contains('entity-item')
    );

    let targetIndex = entityNodes.indexOf(headerNode.parentNode);

    const oldIndex = G.entities.indexOf(currentlyDraggingEntity);
    if (oldIndex !== -1) G.entities.splice(oldIndex, 1);

    G.entities.splice(targetIndex, 0, currentlyDraggingEntity);

    if (placeholderLine && placeholderLine.parentNode) {
      placeholderLine.parentNode.removeChild(placeholderLine);
      placeholderLine = null;
    }

    const evt = new CustomEvent('entity-dropped', { bubbles: true });
    headerNode.dispatchEvent(evt);

    currentlyDraggingEntity = null;
  });
};
