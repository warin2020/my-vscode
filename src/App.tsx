import { useState } from "react";
import Editor from "./components/editor";
import Tree, { TreeNodeData } from "./components/tree";
import styles from "./index.module.scss";

type FileTreeNodeData = TreeNodeData<{
  handle: FileSystemDirectoryHandle | FileSystemFileHandle;
}>;

const App = () => {
  const [currentFileTreeNodeData, setCurrentFileTreeNodeData] = useState<
    FileTreeNodeData & { handle: FileSystemFileHandle }
  >();
  const [fileTreeData, setFileTreeData] = useState<FileTreeNodeData[]>();

  const handleOpenDirectory = async () => {
    const directoryHandle = await window.showDirectoryPicker({
      mode: "readwrite",
    });
    const parseDirectoryHandle = async (
      directoryHandle: FileSystemDirectoryHandle,
      basePath = directoryHandle.name
    ): Promise<FileTreeNodeData[]> => {
      const fileTreeData: FileTreeNodeData[] = [];
      for await (const handle of directoryHandle.values()) {
        const path = `${basePath}/${handle.name}`;
        fileTreeData.push({
          id: path,
          name: handle.name,
          children:
            handle.kind === "directory"
              ? await parseDirectoryHandle(handle, path)
              : undefined,
          handle,
        });
      }
      return fileTreeData.sort((node1, node2) => {
        if (
          node1.handle.kind === "directory" &&
          node2.handle.kind !== "directory"
        ) {
          return -1;
        }
        if (
          node1.handle.kind !== "directory" &&
          node2.handle.kind === "directory"
        ) {
          return 1;
        }
        return node1.name < node2.name ? -1 : 1;
      });
    };
    const fileTreeData = await parseDirectoryHandle(directoryHandle);
    setFileTreeData(fileTreeData);
  };

  const handleChange = async (node: FileTreeNodeData) => {
    if (node.handle.kind === "file") {
      setCurrentFileTreeNodeData({ ...node, handle: node.handle });
    }
  };

  return (
    <div className={styles["layout"]}>
      <div className={styles["sider"]}>
        {fileTreeData ? (
          <Tree<FileTreeNodeData>
            className={styles["file-tree"]}
            treeData={fileTreeData}
            value={currentFileTreeNodeData}
            onChange={handleChange}
          />
        ) : (
          <button onClick={handleOpenDirectory}>Open Directory</button>
        )}
      </div>
      {currentFileTreeNodeData?.handle && (
        <Editor
          className={styles["code-editor"]}
          fileHandle={currentFileTreeNodeData.handle}
        />
      )}
    </div>
  );
};

export default App;
