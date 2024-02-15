import { useDebounceFn } from "ahooks";
import classNames from "classnames";
import { ChangeEventHandler, useEffect, useState } from "react";
import styles from "./index.module.scss";

interface EditorProps {
  className?: string;
  fileHandle: FileSystemFileHandle;
}

const Editor = ({ className, fileHandle }: EditorProps) => {
  const [value, setValue] = useState<string>();

  useEffect(() => {
    let shouldUpdate = true;
    (async () => {
      const file = await fileHandle.getFile();
      const value = await file.text();
      if (shouldUpdate) {
        setValue(value);
      }
    })();
    return () => {
      shouldUpdate = false;
    };
  }, [fileHandle]);

  const { run: handleSave } = useDebounceFn(
    async (fileHandle: FileSystemFileHandle, value: string) => {
      try {
        const writableStream = await fileHandle.createWritable();
        await writableStream.write(value);
        await writableStream.close();
        console.log(`${fileHandle.name} write ${value}`);
      } catch (e) {
        console.log(e);
      }
    },
    { wait: 500 }
  );

  const handleChange: ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    const value = e.target.value;
    setValue(value);
    handleSave(fileHandle, value);
  };

  return (
    <textarea
      className={classNames(styles["editor"], className)}
      value={value}
      onChange={handleChange}
      spellCheck={false}
    />
  );
};

export default Editor;
