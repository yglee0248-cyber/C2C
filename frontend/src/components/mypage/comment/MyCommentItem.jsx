import useAuthStore from "../../utils/useAuthStore";
import styles from "./MyCommentItem.module.css";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import ReportIcon from "@mui/icons-material/Report";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import ReportModal from "../ReportModal";
import { useNavigate } from "react-router-dom";

const MyCommentItem = ({
  comment,
  index,
  commentList,
  setCommentList,
  type, // "market", "community"
  isAdminMode, // 관리자 모드
  tblName, // "marketComment", "communityComment"
  timeAgo,
}) => {
  const memberThumb = comment.writerThumb;
  const memberGrade = useAuthStore((state) => state.memberGrade);
  const [curComment, setCurComment] = useState(comment.commentContent);
  const textareaRef = useRef(null);
  const [isEdited, setIsEdited] = useState(comment.isEdited);
  const navigate = useNavigate();

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"; // 초기화
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px"; // 내용만큼 늘리기
    }
  }, [curComment]); // comment 바뀔 때마다 실행

  // dis: true => 수정 모드
  // dis: false => 실제 수정 요청
  const [dis, setDis] = useState(true);
  const updObj = {
    commentNo: comment.commentNo,
    newComment: curComment,
    type: type, // 백엔드에서 사용
  };
  const updateComment = () => {
    // 화면에서는 완료 버튼이 눌리면 (dis = false) 댓글 수정 요청을 보낸다
    if (!dis) {
      axios
        .patch(
          `${import.meta.env.VITE_BACKSERVER}/mypages/comment/${comment.commentNo}`,
          updObj,
        )
        .then(() => {
          setIsEdited(1);
        });
    }

    setDis(!dis);
  };

  const delObj = {
    commentNo: comment.commentNo,
    type: type, // 백엔드에서 사용
  };
  const deleteComment = () => {
    Swal.fire({
      title: "삭제하시겠습니까?",
      text: "삭제 시 정보를 복구할 수 없습니다",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "삭제",
      cancelButtonText: "취소",
    }).then((result) => {
      if (result.isConfirmed) {
        // 댓글 삭제
        axios
          .delete(
            `${import.meta.env.VITE_BACKSERVER}/mypages/comment/${comment.commentNo}`,
            { data: delObj },
          )
          .then((res) => {
            if (res.data === 1) {
              // 게시글에서 사라지게
              const newCommentList = commentList.filter((c, i) => {
                return i !== index;
              });

              setCommentList(newCommentList);
            }
          })
          .catch((err) => {
            console.log(err);
          });
      }
    });
  };

  return (
    <div
      className={styles.item_wrap}
      onClick={() => {
        // 리스트에서 받아온 타입이 market인지 community인지에 따라 다른 동작
        if (type === "market") {
          navigate(`/market/view/${comment.boardNo}`);
        } else if (type === "community") {
          navigate(`/community/view/${comment.boardNo}`);
        }
      }}
    >
      <div className={styles.comment_wrap}>
        <div className={styles.comment_writer}>
          <div className={styles.writer}>
            <div className={styles.comment_wrtier_thumb}>
              <div
                className={
                  memberThumb ? styles.member_thumb_exists : styles.member_thumb
                }
              >
                {memberThumb ? (
                  <img
                    src={`${import.meta.env.VITE_BACKSERVER}/semi/${memberThumb}`}
                  />
                ) : (
                  <span className="material-icons">account_circle</span>
                )}
              </div>
            </div>
            <div className={styles.comment_writer_info}>
              <div
                className={styles.comment_name}
              >{`${comment.writerName} [${comment.writerId}]`}</div>
            </div>
            <div className={styles.comment_date}>
              {timeAgo(comment.commentDate)}
            </div>
            {isEdited === 1 ? (
              <div className={styles.edited}>(수정됨)</div>
            ) : (
              ""
            )}
          </div>
          <div>
            <div
              className={styles.comment_btn_section}
              onClick={(e) => e.stopPropagation()}
            >
              {isAdminMode === "false" ? (
                <div className={styles.comment_btn} onClick={updateComment}>
                  {dis ? "수정" : "완료"}
                </div>
              ) : (
                ""
              )}
              <div className={styles.comment_btn} onClick={deleteComment}>
                삭제
              </div>
            </div>
          </div>
        </div>
        <div
          className={styles.comment_content}
          onClick={(e) => {
            if (!dis) e.stopPropagation();
          }}
        >
          <textarea
            ref={textareaRef}
            className={styles.textarea}
            value={curComment}
            onChange={(e) => setCurComment(e.target.value)}
            disabled={dis}
            onClick={(e) => {
              if (!dis) {
                e.stopPropagation();
              }
            }}
          />
        </div>
        <div className={styles.comment_actions}>
          <Actions
            comment={comment}
            type={type}
            isAdminMode={isAdminMode}
            tblName={tblName}
          />
        </div>
      </div>
    </div>
  );
};

const Actions = ({ comment, type, isAdminMode, tblName }) => {
  const [open, setOpen] = useState(false);

  // 신고가 있고 관리자모드가 true일 때만 열기
  const showReport = () => {
    if (comment.reportCount <= 0 || isAdminMode === "false") {
      return;
    }

    setOpen(true);
  };

  return (
    <>
      {type === "community" ? (
        <>
          <div
            className={
              comment.isLiked === 1 ? styles.isLiked : styles.action_default
            }
          >
            <ThumbUpIcon />
            <div>{comment.likeCount}</div>
          </div>
          <div
            className={
              comment.isDisliked === 1
                ? styles.isDisliked
                : styles.action_default
            }
          >
            <ThumbDownIcon />
            <div>{comment.dislikeCount}</div>
          </div>
        </>
      ) : (
        ""
      )}
      <div
        className={`${styles.comment_actions_report} ${comment.isReported === 1 ? styles.isReported : styles.action_default}`}
        onClick={(e) => {
          e.stopPropagation();
          showReport();
        }}
      >
        <ReportIcon />
        <div>{comment.reportCount}</div>
      </div>

      {/* 모달 */}
      {open && (
        <div
          className={styles.modal_overlay}
          onClick={(e) => {
            e.stopPropagation();
            setOpen(false);
          }}
        >
          <div
            className={styles.modal_content}
            onClick={(e) => e.stopPropagation()}
          >
            <ReportModal board={comment} tblName={tblName} />
          </div>
        </div>
      )}
    </>
  );
};

export default MyCommentItem;
