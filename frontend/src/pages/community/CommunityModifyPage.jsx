import { useNavigate, useParams } from "react-router-dom";
import styles from "./CommunityModifyPage.module.css";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Input } from "../../components/ui/Form";
import Button from "../../components/ui/Button";
import Swal from "sweetalert2";
import DeleteIcon from "@mui/icons-material/Delete";

//tip-tap editor (에디터 기능들)
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
import UndoIcon from "@mui/icons-material/Undo";
import RedoIcon from "@mui/icons-material/Redo";

const CommunityModifyPage = () => {
  const navigate = useNavigate();
  const params = useParams();
  const communityNo = params.communityNo;
  const [community, setCommunity] = useState({
    communityTitle: "",
    communityContent: "",
  });
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BACKSERVER}/communities/${communityNo}`)
      .then((res) => {
        setCommunity(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  /* 제목 함수 */
  const inputCommunityTitle = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    if (value.length > 50) {
      Swal.fire({
        icon: "warning",
        title: "제목은 최대 50자까지 가능합니다.",
      });
      return;
    }
    setCommunity({ ...community, [name]: value });
  };

  const inputCommunityContent = (data) => {
    setCommunity({
      ...community,
      communityContent: data.html,
      communityText: data.text,
    });
  };

  /* 내용 함수 */
  const modifyCommunity = () => {
    const getTextFromHTML = (html) => {
      const div = document.createElement("div");
      div.innerHTML = html;
      return div.textContent || "";
    };

    const title = (community.communityTitle || "").trim();
    const contentText = getTextFromHTML(
      community.communityContent || "",
    ).trim();

    const isTitleEmpty = title.length === 0;
    const isContentEmpty = contentText.length === 0;

    if (isTitleEmpty || isContentEmpty) {
      Swal.fire("제목과 내용을 입력해주세요.", "", "warning");
      return;
    }

    const form = new FormData();
    form.append("communityTitle", community.communityTitle);
    form.append("communityContent", community.communityContent);
    form.append("communityWriter", community.communityWriter);
    axios
      .put(
        `${import.meta.env.VITE_BACKSERVER}/communities/${communityNo}`,
        form,
      )
      .then(() => {
        Swal.fire({
          icon: "success",
          title: "게시물 수정 성공!",
          confirmButtonText: "확인",
        });
        navigate(`/community/view/${communityNo}`);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <section className={styles.community_modify_wrap}>
      <h3 className="page-title">게시글 수정</h3>

      {/* 제목 필드 */}
      <div className={styles.community_input_wrap}>
        <label htmlFor="communityTitle">제목</label>

        <div className={styles.title_input_box}>
          {community.communityTitle !== "" && (
            <Input
              type="text"
              name="communityTitle"
              id="communityTitle"
              value={community.communityTitle || ""}
              placeholder="제목을 입력해주세요 (최대 50자 입력 가능)"
              onChange={inputCommunityTitle}
            />
          )}

          <span
            className={`${styles.title_count} ${
              community.communityTitle.length >= 50 ? styles.limit : ""
            }`}
          >
            {community.communityTitle.length} / 50
          </span>
        </div>
      </div>

      {/* 내용 필드 */}
      <div className={styles.community_input_wrap}>
        <label htmlFor="communityContent">내용</label>
        {community.communityContent !== "" && (
          <TextEditor
            data={community.communityContent}
            setData={inputCommunityContent}
          />
        )}
      </div>

      <div className={styles.btn_wrap}>
        <Button className="btn primary" onClick={modifyCommunity}>
          수정
        </Button>
        <Button
          className="btn light outline"
          onClick={() => navigate(`/community/view/${communityNo}`)}
        >
          취소
        </Button>
      </div>
    </section>
  );
};

/* 에디터 */
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
        <DeleteIcon className={styles.delete_icon} />
      </button>
    </div>
  );
};

const TextEditor = ({ data, setData }) => {
  const [contentLength, setContentLength] = useState(0);
  let lastValidHTML = useRef("");

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    content: data,

    onUpdate: ({ editor }) => {
      const text = editor.getText();

      const normalizedText = text.replace(/\n\n/g, "\n");

      const textLength = normalizedText.length;

      setContentLength(textLength);

      if (textLength > 4000) {
        alert("최대 4,000자까지 입력 가능합니다.");

        editor.commands.setContent(lastValidHTML.current, false);
        return;
      }

      lastValidHTML.current = editor.getHTML();

      setData({
        html: editor.getHTML(),
        text: text,
      });
    },
  });

  return (
    <div className={styles.editor_wrap}>
      <MenuBar editor={editor} className={styles.menu_bar} />

      <EditorContent editor={editor} className={styles.editor_content} />

      <div
        className={`${styles.editor_count} ${
          contentLength >= 4000 ? styles.limit : ""
        }`}
      >
        {contentLength} / 4000
      </div>
    </div>
  );
};

export default CommunityModifyPage;
