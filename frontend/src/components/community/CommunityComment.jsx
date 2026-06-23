import { useState, useEffect, useRef } from "react";
import axios from "axios";
import styles from "./CommunityComment.module.css";
import Button from "../ui/Button";
import Swal from "sweetalert2";
import useAuthStore from "../utils/useAuthStore";
import Pagination from "../../components/ui/Pagination";
import BasicSelect from "../../components/ui/BasicSelect";
import Nickname from "../commons/Nickname";

// 메인페이지의 함수 그대로 가져옴
const timeAgo = (dateString) => {
  // 받은 시간값이 없으면 return
  if (!dateString) {
    return "";
  }

  const postDate = new Date(dateString); // postDate : 댓글 올린 date(날짜, 시간등)
  const now = new Date(); // now : 지금(현재 날짜, 시간등)

  const diffInSeconds = Math.floor((now - postDate) / 1000); // 현재 시간과 댓글 시간의 차이를 초 단위로 계산

  if (diffInSeconds < 60) {
    return "방금 전";
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}분 전`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}시간 전`;
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}일 전`;
  } else {
    // __.split(" ") : " " 즉 공백을 기준을 자름. 현재 dateString은 예시로 ["2026-04-03", "15:30:00"] 이런식으로 찍힘. 즉 날짜와 시간 사이에 공백이 있음.
    // 그중에 0번 즉 첫번쨰 값을 가져옴 -> 날짜 예시에서의 "2026-04-03"
    return dateString.split(" ")[0];
  }
};

const CommunityComment = ({ communityNo, memberId, communityWriter }) => {
  const [commentList, setCommentList] = useState([]); // 전체 댓글 목록 리스트
  const [newComment, setNewComment] = useState(""); // 새 댓글 내용

  // 페이지네이션용 State 추가
  const [page, setPage] = useState(0); // 현재 페이지 (0부터 시작)
  const [totalPage, setTotalPage] = useState(0); // 전체 페이지 수

  const [orderType, setOrderType] = useState("newest"); // 기본값: 최신순

  const orderList = [
    ["newest", "최신순"],
    ["oldest", "오래된순"],
    ["like", "좋아요순"],
    ["dislike", "싫어요순"],
  ];

  // 셀렉터 값 변경 시 1페이지로 돌아가는 함수들
  const handleOrderChange = (value) => {
    setOrderType(value);
    setPage(0);
    scrollToCommentTop();
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    scrollToCommentTop();
  };

  const { memberThumb, hexCode, memberName } = useAuthStore(); // 새 댓글 작성할때 프사뜨게 하기 위해 가져옴

  const commentWrapRef = useRef(null); // 댓글 입력시 댓글 상단으로 스크롤하기위해 스크롤할 위치를 잡을 Ref

  // 화면 갱신이후에 상단으로 부드럽게 스크롤하는 함수 -> 새댓글 작성, 페이지 넘김등에서 쓰기위해
  const scrollToCommentTop = () => {
    if (commentWrapRef.current) {
      const headerOffset = 148; // 헤더 + 메뉴바의 전체 높이

      // 현재 요소의 위치를 계산해서 헤더 높이만큼 빼줌
      const elementPosition =
        commentWrapRef.current.getBoundingClientRect().top; // getBoundingCliendRect().top : 내 브라우저 화면 맨 위를 기준으로, 이 댓글창이 얼마나 아래에 있는지를 픽셀단위로 가져옴( ref를 현재 댓글 컴포넌트 상단에 두었으니 내 브라우저에서부터의 거리를 상단이랑 잼)
      const offsetPosition = elementPosition + window.scrollY - headerOffset; // window.scrollY : 웹페이지 맨 꼭대기에서부터 얼마나 스크롤을 내렸는지 값 가져옴.

      // 계산된 위치로 부드럽게 이동
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    }
  };

  // 댓글 목록 가져오기
  const fetchComments = () => {
    // 글 번호가 없으면 return
    if (!communityNo) {
      return;
    }

    // 기존 axios는 비동기 통신인데(비동기이기에 backend에 요청보내놓고 front는 바로 다음 코드 진행함) return을 붙이면 backend에 보낸 요청을 받을 값을 받을때까지 기다림
    return axios
      .get(
        `${import.meta.env.VITE_BACKSERVER}/communities/${communityNo}/comments?page=${page}&orderType=${orderType}&memberId=${memberId || ""}`,
      )
      .then((res) => {
        setCommentList(res.data.items);
        setTotalPage(res.data.totalPage);
      })
      .catch((err) => {
        console.log("댓글 로딩 실패:", err);
      });
  };

  // 페이지가 처음 켜질 때(혹은 communityNo이 바뀔 때 등) 댓글 목록 불러오기
  useEffect(() => {
    fetchComments();
  }, [communityNo, page, orderType]);

  // 댓글 작성 로직
  const submitComment = () => {
    // 회원 아이디가 없다면(로그인이 안되어 있다면) -> 현재 전체적인 로직상 뜨지않는 alert지만 누군가 개발자도구로 text, button의 disable을 지우고 댓글작성 시도를 할수도 있으니 만듬
    if (!memberId) {
      Swal.fire({
        icon: "warning",
        title: "로그인 필요",
        text: "로그인 후 이용해주세요.",
      });
      return;
    }

    // 새 댓글 작성의 내용이 없다면
    if (newComment.trim() === "") {
      Swal.fire({
        icon: "warning",
        title: "입력 오류",
        text: "댓글 내용을 입력해주세요.",
      });
      return;
    }

    // backend로 보낼 JSON 데이터
    const commentData = {
      communityNo: communityNo,
      communityCommentWriter: memberId,
      communityCommentContent: newComment,
    };

    axios
      .post(
        `${import.meta.env.VITE_BACKSERVER}/communities/comments`,
        commentData,
      )
      .then((res) => {
        setNewComment(""); // 입력창 비우기

        setPage(0); // 1페이지로 가기
        setOrderType("newest");

        fetchComments(); // 화면 갱신을 위해 목록 다시 불러오기

        scrollToCommentTop();
      })
      .catch((err) => {
        console.log("댓글 작성 실패:", err);
      });
  };

  // 댓글 리스트를 화면에 그려주는 함수
  const renderComments = (parentId) => {
    return (
      commentList
        // 전체 댓글 중에서 '부모 번호(CommunityRecommentNo)'가 현재 찾고 있는 번호(parentId)랑 똑같은 애들만 걸러냄
        // 답글에서 그 답글을 어떤 댓글에 단건지 알기 위해 부모 번호로 그룹지어주기 위해서
        // 처음엔 parentId가 null이니까 최상위 댓글만 뽑아냄.
        .filter((c) => c.communityRecommentNo === parentId)
        .map((comment) => (
          // 뽑아낸 데이터들을 자식 컴포넌트(CommentItem)한테 넘겨주고 화면에 그림
          <CommentItem
            key={comment.communityCommentNo}
            comment={comment} // 댓글 데이터
            memberId={memberId} // 현재 로그인한 유저
            communityWriter={communityWriter} // 게시글 작성자
            fetchComments={fetchComments} // 자식쪽에서 삭제/수정 시 화면 렌더링을 할수있게 함수도 통째로 넘겨줌
            allComments={commentList} // 자식이 자기 밑에 달린 답글 찾을 수 있게 전체 리스트도 넘겨줌
            communityNo={communityNo} // 게시글 번호
            memberThumb={memberThumb} // 답글 작성할때 프사뜨게 하기 위해 넘겨줌
            hexCode={hexCode}
            memberName={memberName}
          />
        ))
    );
  };

  return (
    <div className={styles.comment_wrap} ref={commentWrapRef}>
      <div className={styles.comment_header_wrap}>
        <h4 className={styles.comment_title}>댓글</h4>
        <div className={styles.filter_wrap}>
          {/* 최신/오래된순 정렬 */}
          <BasicSelect
            state={orderType}
            setState={handleOrderChange}
            list={orderList}
          />
        </div>
      </div>

      {/* 최상위 댓글 렌더링 시작 (부모 번호가 null인 애들부터 그림) */}
      <ul className={styles.comment_list}>{renderComments(null)}</ul>

      <div className={styles.comment_write_wrap}>
        <div className={styles.write_header}>
          {memberId && memberThumb ? (
            <img
              src={`${import.meta.env.VITE_BACKSERVER}/semi/${memberThumb}`}
              alt="프로필사진"
            />
          ) : (
            <span className="material-icons">account_circle</span>
          )}
          <span>
            {memberId ? (
              <Nickname
                member={{
                  memberId: memberId,
                  hexCode: hexCode,
                  memberName: memberName,
                }}
              />
            ) : (
              "비회원"
            )}
          </span>
        </div>

        <textarea
          className={styles.comment_textarea}
          placeholder={
            memberId
              ? "댓글을 남겨보세요."
              : "로그인 후 댓글을 작성할 수 있습니다."
          }
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          disabled={!memberId} // memberId가 없으면(비회원이면) true가 되어 비활성화
          maxLength={1000} // 1000자 제한
        />

        <div className={styles.write_footer}>
          <div className={styles.write_actions}>
            <span
              className={styles.char_counter}
              style={{
                color:
                  newComment.length >= 1000 ? "var(--danger)" : "var(--gray4)",
              }}
            >
              {newComment.length}/1000
            </span>
            <Button
              className="btn primary sm"
              onClick={submitComment}
              disabled={!memberId} // 비회원은 클릭 불가
            >
              등록
            </Button>
          </div>
        </div>
      </div>

      <div className={styles.pagination_area}>
        <Pagination
          page={page}
          setPage={handlePageChange}
          totalPage={totalPage}
          naviSize={5} // 아래쪽에 1 2 3 4 5 처럼 5개씩 띄우기
        />
      </div>
    </div>
  );
};

// 개별 댓글 하나하나를 담당하는 '자식' 컴포넌트 (재귀적으로 렌더링) - 이걸로 답글을 혹은 답글의 답글의 답글을 불러올수도 있음
const CommentItem = ({
  comment,
  memberId,
  hexCode,
  fetchComments, // 부모가 준 렌더링 함수
  allComments, // 전체 댓글 리스트, commentList로 하고 싶었는데 위에서 한번 쓴 변수명이니 혹시몰라 이렇게..
  communityNo,
  memberThumb,
  memberName,
}) => {
  // 답글(대댓글) 작성 관련 State
  const [showReplyInput, setShowReplyInput] = useState(false); // 답글달기 입력창 열림/닫힘 여부
  const [replyContent, setReplyContent] = useState(""); // 답글의 내용(value)

  const [isEditing, setIsEditing] = useState(false); // 수정 모드여부 확인
  // 수정창에 띄울 기존댓글 내용
  const [editContent, setEditContent] = useState(
    comment.communityCommentContent,
  );

  const [showReplies, setShowReplies] = useState(false); // '답글 보기' 열림/닫힘 토글

  const isMyComment = memberId === comment.communityCommentWriter; // 내가 쓴 댓글인지 (true, false 저장)

  // 자식 답글들
  // 전체 댓글 리스트를 뒤져서, 부모 번호(communityRecommentNo)가 지금 내 번호(comment.communityCommentNo)랑 똑같은 애들만 필터링
  const childComments = allComments.filter(
    (c) => c.communityRecommentNo === comment.communityCommentNo,
  );

  // 댓글 삭제
  const deleteComment = () => {
    Swal.fire({
      title: "댓글 삭제",
      text: "정말로 이 댓글을 삭제하시겠습니까?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "var(--danger)",
      cancelButtonColor: "var(--gray5)",
      confirmButtonText: "삭제",
      cancelButtonText: "취소",
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .delete(
            `${import.meta.env.VITE_BACKSERVER}/communities/comments/${comment.communityCommentNo}`,
          )
          .then((res) => {
            // 지운 다음에 화면 렌더링 함수
            fetchComments();
          })
          .catch((err) => {
            console.log("삭제 실패", err);
          });
      }
    });
  };

  // 댓글 수정
  const updateComment = () => {
    // 댓글에 내용이 없으면 리턴 (.trim()은 앞뒤 공백을 없애고 글자만 남겨주는 함수)
    if (editContent.trim() === "") {
      return;
    }

    // 수정한 내용과 기존내용이 완전히 똑같으면 서버 요청 안하고 바로 리턴
    if (editContent === comment.communityCommentContent) {
      setIsEditing(false); // 수정창만 닫아버림
      return;
    }

    // 수정할 data
    const updateData = {
      communityCommentNo: comment.communityCommentNo, // 누구를 수정할 건지 PK 전송
      communityCommentContent: editContent, // 댓글의 내용
    };

    axios
      .patch(
        `${import.meta.env.VITE_BACKSERVER}/communities/comments`,
        updateData,
      )
      .then((res) => {
        setIsEditing(false); // 수정 완료됐으니 다른 댓글에서도 수정인지 여부를 따로 따져야하니 기본값으로 초기화
        fetchComments(); // 화면 렌더링
      })
      .catch((err) => {
        console.log("수정 실패", err);
      });
  };

  // 답글 달기
  const submitReply = () => {
    // 답글에 내용이 없으면 리턴
    if (replyContent.trim() === "") {
      return;
    }

    // 답글 data
    const replyData = {
      // 똑같은거 위에도 많으니 주석 굳이 안함
      communityNo: communityNo,
      communityCommentWriter: memberId,
      communityCommentContent: replyContent,
      communityRecommentNo: comment.communityCommentNo, // 여기가 핵심! 부모 번호에 지금 내 번호를 넣어줘서 종속관계를 만듦!
    };

    axios
      .post(
        `${import.meta.env.VITE_BACKSERVER}/communities/comments`,
        replyData,
      )
      .then((res) => {
        setReplyContent(""); // 답글의 내용(value) 초기화
        setShowReplyInput(false); // 입력창 닫기
        setShowReplies(true); // 답글 달았으니 접혀있던 '답글 보기'토글 열기
        fetchComments(); // 화면 렌더링
      })
      .catch((err) => {
        console.log("답글 작성 실패:", err);
      });
  };

  // 댓글 신고하기
  const reportComment = () => {
    if (!memberId) {
      Swal.fire({
        icon: "warning",
        title: "로그인 필요",
        text: "로그인 후 이용해주세요.",
      });
      return;
    }

    // html 속성을 써서 SweetAlert 안에 텍스트 에어리어를 집어넣음
    Swal.fire({
      title: "신고하기",
      html: `
        <textarea id="report-reason" class="swal2-textarea" 
          placeholder="신고 사유를 입력해주세요 (최대 1000자)" 
          maxlength="1000" 
          style="width: 85%; height: 100px; resize: none; font-size: 14px; margin-top: 10px;"></textarea>
        <div id="report-counter" style="text-align: right; width: 85%; margin: 5px auto 0; font-size: 13px; color: var(--gray4);">
          0/1000
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "신고",
      cancelButtonText: "취소",
      confirmButtonColor: "var(--danger)",
      cancelButtonColor: "var(--gray5)",

      allowOutsideClick: false, // 배경(바깥쪽) 클릭해도 안 닫힘
      allowEscapeKey: false, // Esc 눌러도 안 닫힘

      // sweetalert으로 실시간으로 현재 글자수를 띄우기위해 값을 계산해서 addEvent로 input에 넣어주기 위한 함수
      // didOpen : sweetalert에서 제공하는 함수 -> alert창이 뜨고 나서 실행하는 함수
      didOpen: () => {
        // 위의 sweetalert의 html 요소들 가져오기
        const textarea = document.getElementById("report-reason");
        const counter = document.getElementById("report-counter");

        // 가져온 값을 넣어줌
        textarea.addEventListener("input", (e) => {
          const currentLength = e.target.value.length;
          counter.innerText = `${currentLength}/1000`;

          // 1000자가 꽉 차면 빨간색으로 변경
          if (currentLength >= 1000) {
            counter.style.color = "var(--danger)";
          } else {
            counter.style.color = "var(--gray4)";
          }
        });
      },

      preConfirm: () => {
        // 확인 버튼 눌렀을 때 텍스트 박스 내용 긁어오기 외부 - 라이브러리여서 찾아보고 이렇게 사용
        const reason = document.getElementById("report-reason").value;

        // 신고 사유(신고의 텍스트 박스 내용)가 없다면 쓰라고 하기
        if (!reason.trim()) {
          Swal.showValidationMessage("신고 사유를 입력해주세요."); // 빈칸이면 못 넘어가게 막기

          // sweetalert 스타일 맞추기 위해
          const validationMsg = Swal.getValidationMessage();
          if (validationMsg) {
            validationMsg.style.backgroundColor = "transparent";
            validationMsg.style.color = "var(--danger)";
          }
        }
        return reason;
      },
    }).then((result) => {
      // 확인(신고) 눌렀으면 backend로 전송
      if (result.isConfirmed) {
        // 신고 data
        const reportData = {
          communityCommentNo: comment.communityCommentNo,
          memberId: memberId,
          communityCommentReportReason: result.value, // 아까 긁어온 내용
        };

        axios
          .post(
            `${import.meta.env.VITE_BACKSERVER}/communities/comments/reports`,
            reportData,
          )
          .then((res) => {
            Swal.fire({
              icon: "success",
              title: "신고 완료",
              text: "정상적으로 접수되었습니다.",
            });
          })
          .catch((err) => {
            console.log("신고 실패:", err);
            // 복합 유니크 제약조건(뒤의 컬럼1, 컬럼2를 동시에 중복으로 가질수 없음)으로 댓글 신고 테이블에 UNIQUE (컬럼1, 컬럼2)를 이용해서 (댓글번호, 회원아이디)로 한 댓글당 한번만 신고할 수 있게 제약조건으로 막음
            // 위의 이유가 아니어도 그냥 오류로 실패할수도 있으니 text에 처리중 오류가 발생했다고 알림
            Swal.fire({
              icon: "error",
              title: "신고 불가",
              text: "이미 신고한 댓글이거나, 처리 중 오류가 발생했습니다.",
            });
          });
      }
    });
  };

  // // 좋아요 / 싫어요 , on / off마다 들어가는 함수 (4군대나 사용하니까 따로 함수로 지정)
  const fetchAndScroll = () => {
    // fetchComments에서 return axios 했으니 데이터 가져오는 걸 기다렸다가 화면 강제 이동
    const req = fetchComments();
    if (req) {
      // req.then : 서버에서 데이터가 도착하면 동작
      req.then(() => {
        // 서버에서 데이터를 주자마자 스크롤시키면 fetchComments로 selecter에 의해 댓글 순서가 변동되었을때 예전 위치로 스크롤할수 있기에 데이터를 받고 텀을 줌(setTimeout)
        setTimeout(() => {
          // id로 추적. 바로 아래에 특정 댓글을 지정할수 있게 id로 스크롤할 대상 지정했음
          const target = document.getElementById(
            `comment-${comment.communityCommentNo}`,
          );

          if (target) {
            // 헤더 높이(148) + 여백(20) 계산해서 스크롤 이동, 계산할때 target, window 계산방식은 위에서 설명 길게 해놨으니 여기선 생략
            const offset =
              target.getBoundingClientRect().top + window.scrollY - 148 - 20;
            window.scrollTo({ top: offset, behavior: "smooth" });
          }
        }, 100); // 화면이 그려질 시간 0.1초 잠깐 기다려줌 (1000ms = 1초)
      });
    }
  };

  // 좋아요 처리 함수
  const handleLike = () => {
    if (!memberId) {
      Swal.fire({
        icon: "warning",
        title: "로그인 필요",
        text: "로그인 후 이용해주세요.",
      });
      return;
    }

    // 이미 좋아요를 누른 상태면 취소(delete), 아니면 추가(post)
    // isLike = 1 이면 누른상태 0 이면 안 누른 상태 (backend에서도 설명되어 있음.)
    if (comment.isLike === 1) {
      axios
        .delete(
          `${import.meta.env.VITE_BACKSERVER}/communities/comments/${comment.communityCommentNo}/likes`,
        )
        .then((res) => {
          fetchAndScroll();
        })
        .catch((err) => {
          console.log("댓글 좋아요 off 실패:", err);
        });
    } else {
      axios
        .post(
          `${import.meta.env.VITE_BACKSERVER}/communities/comments/${comment.communityCommentNo}/likes`,
        )
        .then((res) => {
          fetchAndScroll();
        })
        .catch((err) => {
          console.log("댓글 좋아요 on 실패:", err);
        });
    }
  };

  // 싫어요 처리 함수
  const handleDislike = () => {
    if (!memberId) {
      Swal.fire({
        icon: "warning",
        title: "로그인 필요",
        text: "로그인 후 이용해주세요.",
      });
      return;
    }

    // 이미 싫어요를 누른 상태면 취소(delete), 아니면 추가(post)
    // isDisLike = 1 이면 누른상태 0 이면 안 누른 상태 (backend에서도 설명되어 있음.)
    if (comment.isDislike === 1) {
      axios
        .delete(
          `${import.meta.env.VITE_BACKSERVER}/communities/comments/${comment.communityCommentNo}/dislikes`,
        )
        .then((res) => {
          fetchAndScroll();
        })
        .catch((err) => {
          console.log("댓글 싫어요 off 실패:", err);
        });
    } else {
      axios
        .post(
          `${import.meta.env.VITE_BACKSERVER}/communities/comments/${comment.communityCommentNo}/dislikes`,
        )
        .then((res) => {
          fetchAndScroll();
        })
        .catch((err) => {
          console.log("댓글 싫어요 on 실패:", err);
        });
    }
  };

  return (
    // 여기 li에 id를 줘서 스크롤할 위치를 잡음(좋아요 / 싫어요 on, off시 여기로 스크롤, 현재 위치는 commentItem 즉 조회해온 댓글중 특정 댓글)
    <li
      className={styles.comment_item}
      id={`comment-${comment.communityCommentNo}`}
    >
      {/* 헤더 영역: 프사, 아이디, 날짜, 수정/삭제 버튼 */}
      <div className={styles.comment_header}>
        <div className={styles.writer_info}>
          {comment.memberThumb ? (
            <img
              src={`${import.meta.env.VITE_BACKSERVER}/semi/${comment.memberThumb}`}
              alt="프로필사진"
            />
          ) : (
            <span className="material-icons">account_circle</span>
          )}
          <span className={styles.writer_id}>
            <Nickname member={comment} />
          </span>
          <span className={styles.comment_date}>
            {timeAgo(comment.communityCommentDate)}
            {/* isEdited가 1이면 (수정됨) 마크 붙여주기 */}
            {comment.isEdited === 1 && (
              <span className={styles.edited_mark}>(수정됨)</span>
            )}
          </span>
        </div>

        {/* 내 댓글이고 수정 중이 아닐 때만 노출 */}
        {isMyComment && !isEditing && (
          <div className={styles.comment_actions}>
            <button onClick={() => setIsEditing(true)}>수정</button>
            <button onClick={deleteComment}>삭제</button>
          </div>
        )}
      </div>

      {/* 내용 영역: 수정 모드일 때랑 그냥 볼 때 분기 처리 */}
      <div className={styles.comment_content}>
        {isEditing ? (
          // 수정 모드일 때 보여줄 폼
          <div className={styles.edit_wrap}>
            <textarea
              className={styles.comment_textarea}
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              maxLength={1000} // 수정창도 1000자 제한
            />
            <div className={styles.write_footer}>
              <div className={styles.write_actions}>
                <span
                  className={styles.char_counter}
                  style={{
                    color:
                      editContent.length >= 1000
                        ? "var(--danger)"
                        : "var(--gray4)",
                  }}
                >
                  {editContent.length}/1000
                </span>
                <div className={styles.btn_group}>
                  <Button
                    className="btn sm"
                    onClick={() => setIsEditing(false)}
                  >
                    취소
                  </Button>
                  <Button className="btn primary sm" onClick={updateComment}>
                    완료
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // 일반 조회 모드
          <p>{comment.communityCommentContent}</p>
        )}
      </div>

      {/* 푸터 영역 : 답글달기, 신고 버튼, 좋아요, 싫어요 (수정 중이 아니고 볼 권한이 있을 때만 노출) */}
      {!isEditing && (
        <div className={styles.comment_footer}>
          {/* 답글달기, 신고 */}
          <div className={styles.footer_actions}>
            {/* 로그인되어 있지 않으면 답글달기 버튼 안뜨게 */}
            {memberId && (
              <button onClick={() => setShowReplyInput(!showReplyInput)}>
                {showReplyInput ? "답글취소" : "답글달기"}
              </button>
            )}
            {/* 내가 쓴 댓글이 아닐 때만 신고 버튼 노출 */}
            {!isMyComment && (
              <button className={styles.report_btn} onClick={reportComment}>
                신고
              </button>
            )}
          </div>

          {/* 좋아요 / 싫어요 */}
          <div className={styles.like_dislike_wrap}>
            <button
              onClick={isMyComment ? null : handleLike} // 본인이면 함수 실행 안 함
              className={`${styles.reaction_btn} ${comment.isLike === 1 ? styles.active_like : ""}`}
              style={{
                cursor: isMyComment ? "default" : "pointer",
              }} // 손가락 커서 없앰
              title={isMyComment ? "내 댓글에는 반응할 수 없습니다." : ""} // 마우스 올리면 툴팁 뜸
            >
              <span className={`material-icons ${styles.icon_size}`}>
                thumb_up
              </span>
              <span>{comment.likeCount || 0}</span>
            </button>

            <button
              onClick={isMyComment ? null : handleDislike} // 본인이면 함수 실행 안 함
              className={`${styles.reaction_btn} ${comment.isDislike === 1 ? styles.active_dislike : ""}`} // 손가락 커서 없앰
              style={{ cursor: isMyComment ? "default" : "pointer" }}
              title={isMyComment ? "내 댓글에는 반응할 수 없습니다." : ""} // 마우스 올리면 툴팁 뜸
            >
              <span className={`material-icons ${styles.icon_size}`}>
                thumb_down
              </span>
              <span>{comment.dislikeCount || 0}</span>
            </button>
          </div>
        </div>
      )}

      {/* 답글 입력창 (답글달기 버튼 눌렀을 때만 렌더링 됨) */}
      {showReplyInput && (
        <div className={styles.reply_write_wrap}>
          {/* 모양은 부모 댓글 입력창이랑 거의 똑같음 */}
          <div className={styles.comment_write_wrap}>
            <div className={styles.write_header}>
              {/* 답글 꺾쇠 화살표 아이콘 */}
              <span className={`material-icons ${styles.reply_arrow_icon}`}>
                subdirectory_arrow_right
              </span>

              {memberThumb ? (
                <img
                  src={`${import.meta.env.VITE_BACKSERVER}/semi/${memberThumb}`}
                  alt="프로필사진"
                  className={styles.reply_profile_img}
                />
              ) : (
                <span className="material-icons">account_circle</span>
              )}
              <span>
                {memberId ? (
                  <Nickname
                    member={{
                      memberId: memberId,
                      hexCode: hexCode,
                      memberName: memberName,
                    }}
                  />
                ) : (
                  "비회원"
                )}
              </span>
            </div>
            <textarea
              className={styles.comment_textarea}
              placeholder="답글을 남겨보세요."
              value={replyContent}
              onChange={(e) => {
                setReplyContent(e.target.value);
              }}
              maxLength={1000} // 답글창 1000자 제한 추가
            />
            <div className={styles.write_footer}>
              <div className={styles.write_actions}>
                <span
                  className={styles.char_counter}
                  style={{
                    color:
                      replyContent.length >= 1000
                        ? "var(--danger)"
                        : "var(--gray4)",
                  }}
                >
                  {replyContent.length}/1000
                </span>
                <Button className="btn primary sm" onClick={submitReply}>
                  등록
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 답글 보기 토글 : 자식 답글이 1개라도 있을 때만 노출 */}
      {childComments.length > 0 && (
        <button
          className={styles.toggle_replies_btn}
          onClick={() => setShowReplies(!showReplies)}
        >
          <span className="material-icons">
            {showReplies ? "expand_less" : "expand_more"}
          </span>
          <span className={styles.toggle_text}>
            {showReplies
              ? "답글 숨기기"
              : `답글 ${childComments.length}개 보기`}
          </span>
        </button>
      )}

      {/* 재귀 호출 파트: showReplies가 true(열림)일 때만 내 밑에 달린 자식 댓글들을 렌더링 */}
      {showReplies && (
        <ul className={styles.reply_list}>
          {childComments.map((child) => (
            // 자기가 자기 자신(CommentItem)을 또 부름 (이래서 대댓글이 계속 이어서 갈 수 있음)
            <CommentItem
              key={child.communityCommentNo}
              comment={child}
              memberId={memberId}
              fetchComments={fetchComments}
              allComments={allComments}
              communityNo={communityNo}
              memberThumb={memberThumb}
              hexCode={hexCode}
              memberName={memberName}
            />
          ))}
        </ul>
      )}
    </li>
  );
};

export default CommunityComment;
