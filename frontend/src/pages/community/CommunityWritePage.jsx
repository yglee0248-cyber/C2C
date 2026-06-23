import { useEffect, useRef, useState } from "react";
import styles from "./CommunityWritePage.module.css";
import Button from "../../components/ui/Button";
import { Input } from "../../components/ui/Form";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import DeleteIcon from "@mui/icons-material/Delete";
import useAuthStore from "../../components/utils/useAuthStore";

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

const CommunityWritePage = () => {
  const { memberId } = useAuthStore();
  const navigate = useNavigate();

  /* 로그인 여부 */
  useEffect(() => {
    if (!memberId) {
      Swal.fire({
        icon: "warning",
        title: "로그인이 필요합니다.",
      }).then(() => {
        navigate("/member/login");
      });
    }
  }, [memberId]);

  const [community, setCommunity] = useState({
    communityTitle: "",
    communityContent: "",
    communityText: "",
    communityWriter: memberId,
  });

  const [member, setMember] = useState(3); // 1: 슈퍼 유저, 2: 관리자, 3: 일반

  /* 제목 함수 */
  const inputCommunityTitle = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    if (value.length > 50) {
      Swal.fire({
        icon: "warning",
        title: "제목을 50자 이상 쓸 수 없어요.",
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
  const registCommunity = () => {
    if (
      community.communityTitle.trim() === "" ||
      community.communityText.trim() === ""
    ) {
      Swal.fire("제목과 내용을 입력해주세요.", "", "warning");
      return;
    }
    const form = new FormData();
    form.append("communityTitle", community.communityTitle);
    form.append("communityContent", community.communityContent);
    form.append("communityWriter", community.communityWriter);

    axios
      .post(`${import.meta.env.VITE_BACKSERVER}/communities`, form, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => {
        if (res.data > 0) {
          Swal.fire({ title: "게시글 작성 완료", icon: "success" }).then(() => {
            /* 관리자나 슈퍼 유저일 때 공지사항으로 등록 */
            if (member === 1 || member === 2) {
              navigate("/community/notice");
            } else {
              /* 일반 유저일 때 */
              navigate("/community");
            }
          });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <section className={styles.community_write_wrap}>
      <h3>게시글 작성</h3>
      {/* 제목 필드 */}
      <div className={styles.community_input_wrap}>
        <label htmlFor="communityTitle">제목</label>
        <div className={styles.title_input_box}>
          <Input
            placeholder="제목을 입력해주세요 (최대 50자 입력 가능)"
            type="text"
            name="communityTitle"
            id="communityTitle"
            value={community.communityTitle}
            onChange={inputCommunityTitle}
          />

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
        <TextEditor
          data={community.communityContent}
          setData={inputCommunityContent}
        />
      </div>

      <div className={styles.community_write_btn_wrap}>
        <Button className="btn primary" onClick={registCommunity}>
          등록
        </Button>
        <Button
          className="btn light outline"
          onClick={() => {
            Swal.fire({
              title: "작성을 취소하시겠어요?",
              icon: "warning",
              showCancelButton: true,
              confirmButtonText: "네",
              cancelButtonText: "아니오",
            }).then((result) => {
              if (result.isConfirmed) {
                navigate("/community");
              }
            });
          }}
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
        className="delete_btn"
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

export default CommunityWritePage;
