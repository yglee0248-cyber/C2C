import styles from "./MarketFrm.module.css";
import Button from "../../components/ui/Button";
import { Input } from "../../components/ui/Form";
import InsertPhotoIcon from "@mui/icons-material/InsertPhoto";
import DeleteIcon from "@mui/icons-material/Delete";
import { useKakaoPostcode } from "@clroot/react-kakao-postcode";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import TextAlign from "@tiptap/extension-text-align";
import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import LooksOneIcon from "@mui/icons-material/LooksOne";
import LooksTwoIcon from "@mui/icons-material/LooksTwo";
import FormatAlignLeftIcon from "@mui/icons-material/FormatAlignLeft";
import FormatAlignCenterIcon from "@mui/icons-material/FormatAlignCenter";
import FormatAlignRightIcon from "@mui/icons-material/FormatAlignRight";
import ClearIcon from "@mui/icons-material/Clear";
import UndoIcon from "@mui/icons-material/Undo";
import RedoIcon from "@mui/icons-material/Redo";
import { useRef } from "react";

const MarketFrm = ({
  market,
  inputMarket,
  inputMarketTitle,
  inputMarketPrice,
  inputMarketContent,
  files,
  addFiles,
  deleteFile,
  addDeleteFileList,
  detailRef,
  open,
}) => {
  return (
    <section className={styles.market_frm_wrap}>
      {/* 제목 필드 */}
      <div className={styles.market_input_wrap}>
        <label htmlFor="marketTitle">제목</label>
        <Input
          type="text"
          name="marketTitle"
          id="marketTitle"
          value={market.marketTitle || ""}
          onChange={inputMarketTitle}
        ></Input>
      </div>
      {/* 금액 필드 */}
      <div className={styles.market_input_wrap}>
        <label htmlFor="sellPrice">판매금액(원)</label>
        <Input
          type="number"
          name="sellPrice"
          id="sellPrice"
          value={market.sellPrice || ""}
          onChange={inputMarketPrice}
          placeholder="숫자만 입력 가능"
        ></Input>
      </div>

      {/* 거래 장소 필드 */}
      <div className={styles.market_input_wrap}>
        <label htmlFor="marketTitle">거래장소</label>

        <div className={styles.market_addr}>
          <Input
            style={{ backgroundColor: "var(--light)" }}
            type="text"
            name="sellAddr"
            id="sellAddr"
            value={market.sellAddr || ""}
            onChange={inputMarket}
            readOnly={true}
          ></Input>

          <Button type="button" className="btn primary" onClick={open}>
            주소 찾기
          </Button>
          <Input
            style={{ display: "none" }}
            type="text"
            name="sellAddrDetail"
            onChange={inputMarket}
            ref={detailRef}
          />
        </div>
      </div>
      {/* MAP API 영역 */}
      <div className={styles.market_input_wrap}>
        <label>API 등록 예정</label>
      </div>

      {/* 내용 필드 */}
      <div>
        <TextEditor data={market.marketContent} setData={inputMarketContent} />
      </div>

      {/* 파일첨부 필드 */}
      <div className={styles.market_file_wrap}>
        <label
          htmlFor="files"
          className={styles.file_btn}
          title="이미지는 최대 10장까지 저장됩니다."
        >
          파일추가
        </label>
        <input
          type="file"
          id="files"
          multiple
          accept="image/*" /* 1차로 업로드파일 이미지로 제한 */
          style={{ display: "none" }}
          onChange={(e) => {
            //e.target.files -> 선택한 파일들을 FileList 객체로 반환 (배열로 유사하지만 배열은 아님)
            //배열로 변환해서 사용
            const fileList = Array.from(e.target.files);
            //console.log(fileList);

            addFiles(fileList);
          }}
        ></input>
        <div className={styles.file_wrap}>
          {market.fileList &&
            market.fileList.map((file, index) => {
              return (
                <FileItem
                  key={"old-file-item-" + index}
                  file={file}
                  deleteFile={addDeleteFileList}
                ></FileItem>
              );
            })}
          {files.map((file, index) => {
            return (
              <FileItem
                key={"file-item-" + index}
                file={file}
                deleteFile={deleteFile}
              ></FileItem>
            );
          })}
        </div>
      </div>
    </section>
  );
};
const MenuBar = ({ editor }) => {
  if (!editor) return null;

  return (
    <div className={styles.menu_bar}>
      {/* H1 */}
      <button
        type="button"
        className={
          editor.isActive("heading", { level: 1 }) ? styles.active : ""
        }
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        title="글자 H1 적용"
      >
        <LooksOneIcon />
      </button>

      {/* H2 */}
      <button
        type="button"
        className={
          editor.isActive("heading", { level: 2 }) ? styles.active : ""
        }
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        title="글자 H2 적용"
      >
        <LooksTwoIcon />
      </button>

      {/* Bold */}
      <button
        type="button"
        className={editor.isActive("bold") ? styles.active : ""}
        onClick={() => editor.chain().focus().toggleBold().run()}
        title="글자 진하게"
      >
        <FormatBoldIcon />
      </button>

      {/* Italic */}
      <button
        type="button"
        className={editor.isActive("italic") ? styles.active : ""}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        title="글자 기울이기"
      >
        <FormatItalicIcon />
      </button>

      {/* 리스트 */}
      <button
        type="button"
        className={editor.isActive("bulletList") ? styles.active : ""}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        title="글자 목록 적용"
      >
        <FormatListBulletedIcon />
      </button>

      {/* 정렬 */}
      <button
        type="button"
        className={editor.isActive({ textAlign: "left" }) ? styles.active : ""}
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
        title="문단 가온데 정렬"
      >
        <FormatAlignCenterIcon />
      </button>

      <button
        type="button"
        className={editor.isActive({ textAlign: "right" }) ? styles.active : ""}
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
        title="문단 오른쪽 정렬"
      >
        <FormatAlignRightIcon />
      </button>

      {/* 색상 */}
      <input
        type="color"
        className={styles.color_picker}
        onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
        title="색상적용"
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
        style={{ backgroundColor: "var(--danger)" }}
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
  );
};

const TextEditor = ({ data, setData }) => {
  //console.log(data);

  let lastValidHTML = "";
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
    /* 에디터의 글자수를 제한 */
    editorProps: {
      handleTextInput(view, from, to, text) {
        const currentHTML = view.dom.innerHTML;
        const newHTML = currentHTML + text;
        const byteLength = new TextEncoder().encode(newHTML).length;
        //console.log("새글자입력" + byteLength);
        if (byteLength > 4000) {
          alert("최대입력수 초과");
          return true; // 입력 막기
        }
        return false;
      },

      handleKeyDown(view, event) {
        if (event.key === "Enter") {
          const html = view.dom.innerHTML;
          const byteLength = new TextEncoder().encode(html).length;
          console.log(byteLength);
          if (byteLength > 4000) {
            alert("더이상 입력할수 없어요");
            return true;
          }
        }
        return false;
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const byteLength = new TextEncoder().encode(html).length;

      if (byteLength > 4000) {
        editor.commands.setContent(lastValidHTML, false);
        console.log(byteLength);
        alert("지워버린다.");
        return;
      }
      lastValidHTML = html;
      setData(html);
    },
  });

  return (
    <div className={styles.editor_wrap}>
      <MenuBar editor={editor} className={styles.menu_bar} />
      <EditorContent editor={editor} className={styles.editor_content} />
    </div>
  );
};
export default MarketFrm;
