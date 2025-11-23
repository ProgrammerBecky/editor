import { addFileDragDropHandler } from './EditorFileDragDrop.js';

export class EditorFilePanel {
  constructor(panelId) {
    this.panel = document.createElement("div");
    this.panel.classList.add("editor-panel");
    this.panel.classList.add(`editor-panel-${panelId}`);
    document.body.appendChild(this.panel);

    this.currentPath = "";

		this.setupEmptySpaceDrop();
    this.loadTree();

    window.assetsAPI.onUpdate(() => {
      this.loadTree();
    });
  }

  destroy() {
    document.body.removeChild(this.panel);
  }

  #getIconFromName(name) {
    const ext = name.split(".").pop().toLowerCase();
    if (["glb", "gltf", "fbx"].includes(ext)) return "📦";
    if (["png", "jpg"].includes(ext)) return "🖼️";
    if (["wav", "mp3", "ogg"].includes(ext)) return "🔊";
    if (["mp3"].includes(ext)) return "🎵";
    if (["js"].includes(ext)) return "👩‍💻";
    if (["json"].includes(ext)) return "📊";
    if (["txt"].includes(ext)) return "📃";
    if (["bin"].includes(ext)) return "🎰";
    return "📄";
  }

  async loadTree() {
    const tree = await window.assetsAPI.getTree();
    const target = this.findFolderByPath(tree, this.currentPath.split("/").filter(v => v));
    this.renderFolder(target || tree, tree);
  }

  findFolderByPath(nodes, parts) {
    if (parts.length === 0) return nodes;
    const next = parts.shift();
    const folder = nodes.find(n => n.type === "folder" && n.name === next);
    if (!folder) return null;
    return this.findFolderByPath(folder.children, parts);
  }

  renderFolder(nodes, fullTree) {
    this.panel.innerHTML = "";

    if (this.currentPath !== "") {
      const up = document.createElement("div");
      up.classList.add("file-browser-item");
      up.textContent = "↩️ ..";

      up.addEventListener("click", () => {
        const parts = this.currentPath.split("/").filter(v => v);
        parts.pop();
        this.currentPath = parts.join("/");
        this.loadTree();
      });

      addFileDragDropHandler(
        up,
        () => up.dataset.dragSource || null,
        async (srcPath) => {
          const parts = this.currentPath.split("/").filter(v => v);
          parts.pop();
          const targetFolder = parts.join("/");
          await window.assetsAPI.moveFile(srcPath, targetFolder);
          this.loadTree();
        }
      );

      this.panel.appendChild(up);
    }

    nodes.forEach(node => {
      const div = document.createElement("div");
      div.classList.add("file-browser-item");

      if (node.type === "folder") {
        div.classList.add("file-browser-folder");
        div.textContent = "📁 " + node.name;

        div.addEventListener("click", () => {
          this.currentPath = (this.currentPath ? this.currentPath + "/" : "") + node.name;
          this.loadTree();
        });

        addFileDragDropHandler(
          div,
          () => (this.currentPath ? this.currentPath + "/" : "") + node.name,
          async (srcPath) => {
            const destPath = (this.currentPath ? this.currentPath + "/" : "") + node.name;
            await window.assetsAPI.moveFile(srcPath, destPath);
            this.loadTree();
          }
        );

        this.panel.appendChild(div);
      } else {
        div.textContent = this.#getIconFromName(node.name) + " " + node.name;

        addFileDragDropHandler(
          div,
          () => (this.currentPath ? this.currentPath + "/" : "") + node.name,
          async (srcPath) => {
            const destPath = this.currentPath;
            await window.assetsAPI.moveFile(srcPath, destPath);
            this.loadTree();
          }
        );

        this.panel.appendChild(div);
      }
    });
  }
	
	setupEmptySpaceDrop() {
		this.panel.addEventListener("dragover", (e) => {
			e.preventDefault();
			this.panel.classList.add("drag-hover");
		});

		this.panel.addEventListener("dragleave", () => {
			this.panel.classList.remove("drag-hover");
		});

		this.panel.addEventListener("drop", async (e) => {
			e.preventDefault();
			this.panel.classList.remove("drag-hover");

			const srcPath = e.dataTransfer.getData("text/plain");
			if (!srcPath) return;

			const targetFolder = this.currentPath;
			await window.assetsAPI.moveFile(srcPath, targetFolder);

			this.loadTree();
		});
	}
}
