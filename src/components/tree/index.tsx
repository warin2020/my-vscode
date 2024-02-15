import { useState } from "react";
import { BiChevronDown, BiChevronRight } from "react-icons/bi";
import styles from "./index.module.scss";
import classNames from "classnames";

export type TreeNodeData<T = object> = {
  id: string;
  name: string;
  children?: TreeNodeData<T>[];
} & T;

interface TreeSelectProps<T> {
  value?: TreeNodeData<T>;
  onChange?: (value: TreeNodeData<T>) => void;
}

interface TreeNodeProps<T> extends TreeSelectProps<T> {
  treeNodeData: TreeNodeData<T>;
}

const TreeNode = <T,>({
  treeNodeData,
  ...treeSelectProps
}: TreeNodeProps<T>) => {
  const { id, name, children } = treeNodeData;
  const { value, onChange } = treeSelectProps;

  const [isCollapse, setIsCollapse] = useState(false);

  const CollapseIcon = isCollapse ? BiChevronDown : BiChevronRight;

  return (
    <li className={styles["tree-node"]}>
      <div
        className={classNames(
          styles["tree-node__content"],
          value?.id === id && styles["tree-node__content--active"]
        )}
        onClick={() => {
          setIsCollapse((x) => !x);
          onChange?.(treeNodeData);
        }}
      >
        {children && (
          <span className={styles["collapse-icon-wrapper"]}>
            <CollapseIcon className={styles["collapse-icon"]} />
          </span>
        )}
        <span className={styles["node-name"]}>{name}</span>
      </div>
      {children && (
        <div
          className={styles["tree-node__sub-tree-wrapper"]}
          style={!isCollapse ? { display: "none" } : {}}
        >
          <Tree treeData={children} {...treeSelectProps} />
        </div>
      )}
    </li>
  );
};

interface TreeProps<T> extends TreeSelectProps<T> {
  treeData: TreeNodeData<T>[];
  className?: string;
}

const Tree = <T,>({
  treeData,
  className,
  ...treeSelectProps
}: TreeProps<T>) => {
  return (
    <ul className={classNames(styles["tree"], className)}>
      {treeData.map((treeNodeData) => (
        <TreeNode<T>
          key={treeNodeData.id}
          treeNodeData={treeNodeData}
          {...treeSelectProps}
        />
      ))}
    </ul>
  );
};

export default Tree;
