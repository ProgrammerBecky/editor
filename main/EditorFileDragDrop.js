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
  });

  node.addEventListener("dragover", e => {
    e.preventDefault();
    node.classList.add("drag-hover");
  });

  node.addEventListener("dragleave", () => {
    node.classList.remove("drag-hover");
  });

  node.addEventListener("drop", async e => {
    e.preventDefault();
    node.classList.remove("drag-hover");

    if (!currentlyDragging) return;

    const srcPath = currentlyDragging.path;
    if (!srcPath) return;

    await onDropFn(srcPath);

    currentlyDragging = null;
  });
};