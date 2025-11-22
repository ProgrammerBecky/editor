import chokidar from "chokidar";
import path from "path";
import { readDirectoryTree } from "./readDirectoryTree.js";

export function setupFileWatcher(win, assetsPath) {
  const watcher = chokidar.watch(assetsPath, { ignoreInitial: true });

  watcher.on("all", () => {
    const tree = readDirectoryTree(assetsPath);
    win.webContents.send("assets:updated", tree);
  });
}