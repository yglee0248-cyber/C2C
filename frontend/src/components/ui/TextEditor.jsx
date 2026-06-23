import { EditorContent, useEditor } from "@tiptap/react";
import styles from "./TextEditor.module.css";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import DeleteIcon from "@mui/icons-material/Delete";
import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import FormatAlignLeftIcon from "@mui/icons-material/FormatAlignLeft";
import FormatAlignCenterIcon from "@mui/icons-material/FormatAlignCenter";
import FormatAlignRightIcon from "@mui/icons-material/FormatAlignRight";
import LooksOneIcon from "@mui/icons-material/LooksOne";
import LooksTwoIcon from "@mui/icons-material/LooksTwo";
import UndoIcon from "@mui/icons-material/Undo";
import RedoIcon from "@mui/icons-material/Redo";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { useEffect } from "react";

const TextEditor = ({ data, setData }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    content: data || "",
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      setData(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && data !== undefined) {
      editor.commands.setContent(data);
    }
  }, [editor, data]);
  return (
    <div className={styles.editor_wrap}>
      <MenuBar editor={editor} />
      <EditorContent editor={editor} className={styles.editor_content} />
    </div>
  );
};

const MenuBar = ({ editor }) => {
  if (!editor) {
    return null;
  }
  return (
    <>
      <div className={styles.menu_bar}>
        <button
          type="button"
          className={
            editor.isActive("heading", { level: 1 }) ? styles.active : ""
          }
          onClick={() => {
            editor.chain().focus().toggleHeading({ level: 1 }).run();
          }}
        >
          <LooksOneIcon />
        </button>

        <button
          type="button"
          className={
            editor.isActive("heading", { level: 2 }) ? styles.active : ""
          }
          onClick={() => {
            editor.chain().focus().toggleHeading({ level: 2 }).run();
          }}
        >
          <LooksTwoIcon />
        </button>

        <button
          type="button"
          className={editor.isActive("bold") ? styles.active : ""}
          onClick={() => {
            editor.chain().focus().toggleBold().run();
          }}
        >
          <FormatBoldIcon />
        </button>

        <button
          type="button"
          className={editor.isActive("italic") ? styles.active : ""}
          onClick={() => {
            editor.chain().focus().toggleItalic().run();
          }}
        >
          <FormatItalicIcon />
        </button>

        <button
          type="button"
          className={editor.isActive("bulletList") ? styles.active : ""}
          onClick={() => {
            editor.chain().focus().toggleBulletList().run();
          }}
        >
          <FormatListBulletedIcon />
        </button>

        {/* 정렬 */}
        <button
          type="button"
          className={
            editor.isActive({ textAlign: "left" }) ? styles.active : ""
          }
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          title="문단 왼쪽 정렬"
        >
          <FormatAlignLeftIcon />
        </button>

        <button
          type="button"
          className={
            editor.isActive({ textAlign: "center" }) ? styles.active : ""
          }
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          title="문단 가운데 정렬"
        >
          <FormatAlignCenterIcon />
        </button>

        <button
          type="button"
          className={
            editor.isActive({ textAlign: "right" }) ? styles.active : ""
          }
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          title="문단 오른쪽 정렬"
        >
          <FormatAlignRightIcon />
        </button>

        {/* 색상 */}
        <input
          type="color"
          className={styles.color_picker}
          onChange={(e) =>
            editor.chain().focus().setColor(e.target.value).run()
          }
          title="색상 적용"
        />

        {/* 되돌리기 */}
        <button
          type="button"
          disabled={!editor.can().undo()}
          onClick={() => editor.chain().focus().undo().run()}
          title="작업 되돌리기"
        >
          <UndoIcon />
        </button>

        {/* 다시하기 */}
        <button
          type="button"
          disabled={!editor.can().redo()}
          onClick={() => editor.chain().focus().redo().run()}
          title="작업 다시하기"
        >
          <RedoIcon />
        </button>

        {/* 삭제 */}
        <button
          type="button"
          disabled={editor.isEmpty}
          onClick={() => {
            Swal.fire({
              title: "내용을 모두 삭제하시겠습니까?",
              icon: "warning",
              showCancelButton: true,
              confirmButtonText: "삭제",
              cancelButtonText: "취소",
            }).then((result) => {
              if (result.isConfirmed) {
                editor.chain().focus().clearContent().run();
              }
            });
          }}
          title="지우기"
        >
          <DeleteIcon />
        </button>
      </div>
    </>
  );
};

export default TextEditor;
