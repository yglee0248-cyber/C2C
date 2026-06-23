import styles from "./MyBoardItem.module.css";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import CommentIcon from "@mui/icons-material/Comment";
import ReportIcon from "@mui/icons-material/Report";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useState } from "react";
import Switch from "@mui/material/Switch";
import axios from "axios";
import Swal from "sweetalert2";
import ReportModal from "../ReportModal";
import { useNavigate } from "react-router-dom";
import PrivateReportModal from "../PrivateReportModal";

const MyMarketItem = ({
  board,
  index,
  boardList,
  setBoardList,
  status, // select 필터 0: 전체 / 1: 공개 / 2: 비공개
  isAdminMode, // true->관리 / false->일반
  timeAgo,
  isPrivate, // 좋아요/싫어요/신고 누른 게시글용
  type, // 좋아요/싫어요/신고
}) => {
  const [contentStatus, setContentStatus] = useState(board.contentStatus);
  const navigate = useNavigate();

  // 게시글 숨기기 (관리자용)
  const changeStatus = () => {
    const toggle = contentStatus === 1 ? 2 : 1; // 1: 공개 / 2: 비공개
    const obj = { boardNo: board.boardNo, status: toggle };

    // 거래 게시글 상태(공개 여부) update
    axios
      .patch(
        `${import.meta.env.VITE_BACKSERVER}/mypages/board/market/${board.boardNo}`,
        obj,
      )
      .then((res) => {
        // status -> select 필터 0: 전체 / 1: 공개 / 2: 비공개
        // 현재 select가 공개 or 비공개일 때 토글 누르면 리스트에서 사라지기
        if (res.data === 1 && status !== 0) {
          const newBoardList = boardList.filter((b, i) => {
            return i !== index;
          });
          setBoardList(newBoardList);
        }
      })
      .catch((err) => {
        console.log(err);
      });

    setContentStatus(toggle); // 토글 변화용(프론트)
  };

  // 게시글 삭제 (관리자용)
  const deleteBoard = () => {
    Swal.fire({
      title: "삭제하시겠습니까?",
      text: "삭제 시 정보를 복구할 수 없습니다",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "삭제",
      cancelButtonText: "취소",
    }).then((result) => {
      if (result.isConfirmed) {
        // 거래 게시글 delete
        axios
          .delete(
            `${import.meta.env.VITE_BACKSERVER}/mypages/board/market/${board.boardNo}`,
          )
          .then((res) => {
            if (res.data === 1) {
              // 삭제되면 리스트에서 사라지기
              const newBoardList = boardList.filter((b, i) => {
                return i !== index;
              });
              setBoardList(newBoardList);
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
      className={`${styles.item} isAdminMode === "true" ? ${styles.item_admin} : ""`}
      onClick={() => {
        navigate(`/market/view/${board.boardNo}`);
      }}
    >
      {/* 거래, 커뮤 확인용 */}
      <div className={styles.item_wrap}>
        {board.boardType ? ( // 타입이 있을때만
          board.boardType === "market" ? (
            <div className={styles.board_type}>거래 게시판</div>
          ) : (
            <div className={styles.board_type}>커뮤니티 게시판</div>
          )
        ) : (
          ""
        )}
        <div className={styles.item_title}>{board.title}</div>
        <div className={styles.item_info}>
          <div className={styles.writer_info}>
            <div>{`${board.writerName} [${board.writerId}]`}</div>
            <div>{timeAgo(board.contentDate)}</div>
          </div>
          <div>
            <div className={styles.views}>
              <VisibilityIcon /> {board.viewCount}
            </div>
          </div>
        </div>
        <div className={styles.item_actions}>
          {/* 좋아요, 싫어요, 댓글, 신고 */}
          <Actions
            board={board}
            isAdminMode={isAdminMode} // 관리자모드 여부
            isPrivate={isPrivate} // 좋아요/싫어요/신고 게시글
            type={type} // 좋아요/싫어요/신고
          />
        </div>
        <div className={styles.views_done}>
          <div className={styles.views}></div>
          <div className={styles.done}>
            <div>{board.isCompleted === 1 ? "거래 완료" : "거래 미완료"}</div>
            {board.isCompleted === 1 ? <div>[{board.completedDate}]</div> : ""}
          </div>
        </div>
      </div>
      {isAdminMode === "false" ? (
        ""
      ) : (
        <div
          className={styles.admin_section}
          onClick={(e) => e.stopPropagation()}
        >
          <Switch
            className={styles.switch}
            sx={{
              "& .MuiSwitch-thumb": {
                color: "var(--primary)",
              },
              "& .MuiSwitch-track": {
                backgroundColor: "var(--gray3)",
              },
            }}
            checked={contentStatus === 1}
            onChange={changeStatus}
          />
          <div className={styles.btn_section}>
            <div className={styles.btn} onClick={deleteBoard}>
              삭제
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Actions = ({ board, isAdminMode, isPrivate, type }) => {
  const [open, setOpen] = useState(false);
  const [privateOpen, setPrivateOpen] = useState(false);

  // 신고 모달
  const showReport = () => {
    // 신고가 있고 관리자모드 일 때
    if (board.reportCount > 0 && isAdminMode === "true") {
      setOpen(true);
    }

    // 내가 누른 신고가 있고 관리자모드가 아닐 때
    if (
      board.isReported === 1 &&
      isAdminMode === "false" &&
      isPrivate === "true" &&
      type === "3"
    ) {
      setPrivateOpen(true);
    }
  };

  return (
    <>
      <div
        className={board.isLiked === 1 ? styles.isLiked : styles.action_default}
      >
        <ThumbUpIcon />
        <div>{board.likeCount}</div>
      </div>
      <div
        className={
          board.isCommented === 1 ? styles.isCommented : styles.action_default
        }
      >
        <CommentIcon />
        <div>{board.commentCount}</div>
      </div>
      <div
        className={`${styles.item_actions_report} ${board.isReported === 1 ? styles.isReported : styles.action_default}`}
        onClick={(e) => {
          e.stopPropagation();
          showReport();
        }}
      >
        <ReportIcon />
        <div>{board.reportCount}</div>
      </div>

      {/* 관리자 모드 모달 */}
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
            {/* 거래인지 커뮤인지 타입을 tblName으로 넘긴다 */}
            <ReportModal board={board} tblName="market" />
          </div>
        </div>
      )}

      {/* 일반 유저 모드 모달 */}
      {privateOpen && (
        <div
          className={styles.modal_overlay}
          onClick={(e) => {
            e.stopPropagation();
            setPrivateOpen(false);
          }}
        >
          <div
            className={styles.modal_content}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 거래인지 커뮤인지 타입을 tblName으로 넘긴다 */}
            <PrivateReportModal board={board} tblName="market" />
          </div>
        </div>
      )}
    </>
  );
};

export default MyMarketItem;
