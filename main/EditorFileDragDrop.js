let currentlyDragging = null;

export const addFileDragDropHandler = (node, getPathFn, onDropFn) => {
  node.setAttribute("draggable", true);

  node.addEventListener("dragstart", e => {
    currentlyDragging = {
      path: getPathFn(),
      node,
    };
    node.classList.add("dragging");
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", currentlyDragging.path);
  });

  node.addEventListener("dragend", () => {
    currentlyDragging = null;
    node.classList.remove("dragging");
    node.classList.remove("drag-hover"); // ensure highlight removed
  });

  node.addEventListener("dragover", e => {
    e.preventDefault();
    if (!node.classList.contains("drag-hover")) {
      node.classList.add("drag-hover"); // highlight folder while dragging over
    }
  });

  node.addEventListener("dragleave", () => {
    node.classList.remove("drag-hover"); // remove highlight when leaving
  });

  node.addEventListener("drop", async e => {
    e.preventDefault();
    node.classList.remove("drag-hover");

    if (!currentlyDragging) return;
    const srcPath = currentlyDragging.path;
    if (!srcPath) return;

    await onDropFn(srcPath); // call your move function or callback

    currentlyDragging = null;
  });
};
