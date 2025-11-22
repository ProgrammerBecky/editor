import fs from "fs";
import path from "path";

export function readDirectoryTree(dirPath) {
  const items = fs.readdirSync(dirPath);

  return items.map(item => {
    const fullPath = path.join(dirPath, item);
    const isDir = fs.statSync(fullPath).isDirectory();

    return {
      name: item,
      path: fullPath,
      type: isDir ? "folder" : "file",
      children: isDir ? readDirectoryTree(fullPath) : []
    };
  });
}