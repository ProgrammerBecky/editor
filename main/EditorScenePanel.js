import { EntityCube } from './Entities/EntityCube.js';
import { EntityPlane } from './Entities/EntityPlane.js';
import { EntityTerrain } from './Entities/EntityTerrain.js';
import { G } from '../G.js';
import { addDragDropArrayHandler } from './EditorSceneDragDrop.js';

export class EditorScenePanel {
  constructor(panelId) {
		
		this.refresh = this.refresh.bind(this);
		
    if (!G.entities) G.entities = [
      new EntityTerrain(),
      new EntityCube(),
      new EntityPlane(),
    ];

    this.panel = document.createElement("div");
    this.panel.classList.add("editor-panel");
    this.panel.classList.add(`editor-panel-${panelId}`);
    document.body.appendChild(this.panel);

    this.entityClasses = [
      { name: "Terrain", cls: EntityTerrain },
      { name: "Cube", cls: EntityCube },
      { name: "Plane", cls: EntityPlane },
    ];

    this.buildControlBar();

    this.entityListContainer = document.createElement("div");
    this.entityListContainer.classList.add("entity-list");
    this.panel.appendChild(this.entityListContainer);
		
		window.addEventListener( 'update-editor-ui' , this.refresh );
		this.refresh();
  }
	
	refresh() {
		this.renderEntityList(this.entityListContainer, G.entities, true);		
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
      entity.isPanelOpen = false;
      G.entities.unshift(entity);
      this.renderEntityList(this.entityListContainer, G.entities, true);
    });
    controlBar.appendChild(addButton);

    this.panel.appendChild(controlBar);
  }

  destroy() {
		window.removeListener( 'update-editor-ui' , this.uiUpdateEventListener );
    document.body.removeChild(this.panel);
  }

  togglePanel(entity) {
    entity.isPanelOpen = !entity.isPanelOpen;
    this.renderEntityList(this.entityListContainer, G.entities, true);
  }

  renderEntityList(container, entities, isTopLevel = false, parentEntity = null) {
    container.innerHTML = "";

    entities.forEach(entity => {
      if (!entity.entityList) entity.entityList = [];
      if (typeof entity.isPanelOpen !== "boolean") entity.isPanelOpen = false;

      const node = document.createElement("div");
      node.classList.add("entity-item");
      node.style.position = "relative";

      const header = document.createElement("div");
      header.classList.add("entity-header");
      header.textContent = entity.editorName ?? "<i>unnamed entity</i>";
      header.addEventListener("click", () => this.togglePanel(entity));
      node.appendChild(header);

      container.appendChild(node);

      // Determine correct array for drag-drop
      const arrayForDrag = isTopLevel ? G.entities : (parentEntity ? parentEntity.entityList : []);
      addDragDropArrayHandler(entity, header, arrayForDrag);
      header.addEventListener('entity-dropped', () => {
        this.renderEntityList(container, entities, isTopLevel, parentEntity);
      });

      if (entity.isPanelOpen) {
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
            newChild.isPanelOpen = false;
            entity.entityList.unshift(newChild);
            this.renderEntityList(container, entities, isTopLevel, parentEntity);
          });
          childControlBar.appendChild(addButton);

          node.appendChild(childControlBar);

          const childContainer = document.createElement("div");
          childContainer.classList.add("entity-child-list");
          node.appendChild(childContainer);

          // Recursive render for children
          this.renderEntityList(childContainer, entity.entityList, false, entity);
        }
      }
			else if( entity.entityList.length > 0 ) {
				const icon = document.createElement("span");
				icon.textContent = "🫙";
				icon.classList.add("entity-open-icon");
				node.appendChild(icon);				
			}
    });
  }
}
