import { EntityInterface } from './Entities/EntityInterface.js';
import { EntityCube } from './Entities/EntityCube.js';
import { EntityPlane } from './Entities/EntityPlane.js';
import { EntityTerrain } from './Entities/EntityTerrain.js';
import { G } from '../G.js';
import { addDragDropArrayHandler } from './EditorSceneDragDrop.js';

export class EditorScenePanel {
  constructor(panelId) {
    this.refresh = this.refresh.bind(this);
    this.openState = new WeakMap();

    if (!G.entities) G.entities = [new EntityCube()];

    this.panel = document.createElement("div");
    this.panel.classList.add("editor-panel", `editor-panel-${panelId}`);
    document.body.appendChild(this.panel);

    this.entityClasses = [
      { name: "Empty", cls: EntityInterface },
      { name: "Terrain", cls: EntityTerrain },
      { name: "Cube", cls: EntityCube },
      { name: "Plane", cls: EntityPlane },
    ];

    this.buildControlBar();

    this.entityListContainer = document.createElement("div");
    this.entityListContainer.classList.add("entity-list");
    this.panel.appendChild(this.entityListContainer);

    window.addEventListener('update-editor-ui', this.refresh);
    this.refresh();
  }

  getFocusedInputIndex(container) {
    const inputs = container.querySelectorAll('input, textarea, select');
    const focused = document.activeElement;
    for (let i = 0; i < inputs.length; i++) {
      if (inputs[i] === focused) return i;
    }
    return null;
  }

  restoreFocusedInput(container, index) {
    if (index === null) return;
    const inputs = container.querySelectorAll('input, textarea, select');
    if (index < inputs.length) inputs[index].focus();
  }

	refresh() {
		// Delay execution to ensure any input values have updated
		setTimeout(() => {
			const scrollContainer = this.entityListContainer.parentNode;
			const scrollTop = scrollContainer.scrollTop;

			// --- Save focused input info ---
			let focusedIndex = null;
			let cursor = null;
			let numberValue = null;

			const focused = document.activeElement;
			if (this.entityListContainer.contains(focused)) {
				const inputs = this.entityListContainer.querySelectorAll('input, textarea, select');
				for (let i = 0; i < inputs.length; i++) {
					if (inputs[i] === focused) {
						focusedIndex = i;
						cursor = { start: focused.selectionStart, end: focused.selectionEnd };
						break;
					}
				}
			}

			const tempContainer = document.createElement("div");
			tempContainer.className = this.entityListContainer.className;
			tempContainer.style.visibility = "hidden"; // hide until ready
			this.renderEntityList(tempContainer, G.entities, true);

			scrollContainer.replaceChild(tempContainer, this.entityListContainer);
			this.entityListContainer = tempContainer;

			scrollContainer.scrollTop = scrollTop;

			requestAnimationFrame(() => {
				tempContainer.style.visibility = "";

				if (focusedIndex !== null) {
					const inputs = this.entityListContainer.querySelectorAll('input, textarea, select');
					const input = inputs[focusedIndex];
					if (!input) return;

					input.focus();

					if (cursor && cursor.start !== null && cursor.end !== null) {
						input.setSelectionRange(cursor.start, cursor.end);
					}

				}
			});
		}, 0);
	}

  buildControlBar() {
    const controlBar = document.createElement("div");
    controlBar.classList.add("entity-control-bar");

    this.entitySelect = document.createElement("select");
    this.entityClasses.forEach(({ name }) => {
      const option = document.createElement("option");
      option.value = name;
      option.textContent = name;
      this.entitySelect.appendChild(option);
    });
    controlBar.appendChild(this.entitySelect);

    const addButton = document.createElement("button");
    addButton.textContent = "➕";
    addButton.addEventListener("click", e => {
      e.stopPropagation();
      const cls = this.entityClasses.find(c => c.name === this.entitySelect.value)?.cls;
      if (!cls) return;
      const entity = new cls();
      entity.entityList = [];
      G.entities.unshift(entity);
      window.dispatchEvent(new CustomEvent('update-editor-ui'));
    });
    controlBar.appendChild(addButton);

    this.panel.appendChild(controlBar);
  }

  destroy() {
    window.removeEventListener('update-editor-ui', this.uiUpdateEventListener);
    document.body.removeChild(this.panel);
  }

  togglePanel(entity) {
    const current = this.openState.get(entity) || false;
    this.openState.set(entity, !current);
    this.refresh();
  }

  renderEntityList(container, entities, isTopLevel = false, parentEntity = null) {
    const fragment = document.createDocumentFragment();

    entities.forEach(entity => {
      if (!entity.entityList) entity.entityList = [];

      const node = document.createElement("div");
      node.classList.add("entity-item");
      node.style.position = "relative";

      const header = document.createElement("div");
      header.classList.add("entity-header");
      header.textContent = entity.editorName ?? "<i>unnamed entity</i>";
      header.addEventListener("click", () => this.togglePanel(entity));
      node.appendChild(header);

      const arrayForDrag = isTopLevel ? G.entities : (parentEntity ? parentEntity.entityList : []);
      addDragDropArrayHandler(entity, header, arrayForDrag);
      header.addEventListener('entity-dropped', () => {
        window.dispatchEvent(new CustomEvent('update-editor-ui'));
      });

      const isOpen = this.openState.get(entity) || false;

      if (isOpen) {
        const panelNode = entity.showEditorPanel();
        if (panelNode instanceof Node) {
          panelNode.classList.add("entity-sub-panel");
          node.appendChild(panelNode);

          const icon = document.createElement("span");
          icon.textContent = "⭕";
          icon.classList.add("entity-open-icon");
          node.appendChild(icon);

          const childControlBar = document.createElement("div");
          childControlBar.classList.add("entity-child-control-bar");

          const childSelect = document.createElement("select");
          this.entityClasses.forEach(({ name }) => {
            const option = document.createElement("option");
            option.value = name;
            option.textContent = name;
            childSelect.appendChild(option);
          });
          childSelect.addEventListener("click", e => e.stopPropagation());
          childControlBar.appendChild(childSelect);

          const addButton = document.createElement("button");
          addButton.textContent = "➕";
          addButton.addEventListener("click", e => {
            e.stopPropagation();
            const cls = this.entityClasses.find(c => c.name === childSelect.value)?.cls;
            if (!cls) return;
            const newChild = new cls();
            newChild.entityList = [];
            entity.entityList.unshift(newChild);
            window.dispatchEvent(new CustomEvent('update-editor-ui'));
          });
          childControlBar.appendChild(addButton);

          node.appendChild(childControlBar);

          const childContainer = document.createElement("div");
          childContainer.classList.add("entity-child-list");
          node.appendChild(childContainer);

          if (entity.entityList.length === 0) {
            const placeholder = document.createElement("div");
            placeholder.textContent = 'no children';
            placeholder.classList.add("entity-child-placeholder");
            childContainer.appendChild(placeholder);

            addDragDropArrayHandler(entity, placeholder, entity.entityList);

            placeholder.addEventListener("entity-dropped", () => {
              window.dispatchEvent(new CustomEvent('update-editor-ui'));
            });

            node.appendChild(placeholder);
          }

          this.renderEntityList(childContainer, entity.entityList, false, entity);
        }
      } else if (entity.entityList.length > 0) {
        const icon = document.createElement("span");
        icon.textContent = "🫙";
        icon.classList.add("entity-open-icon");
        node.appendChild(icon);
      }

      fragment.appendChild(node);
    });

    container.appendChild(fragment);
  }
}
