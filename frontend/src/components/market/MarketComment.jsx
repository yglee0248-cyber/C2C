import { useState, useEffect, useRef } from "react";
import axios from "axios";
import styles from "./MarketComment.module.css";
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

const MarketComment = ({ marketNo, memberId, marketWriter }) => {
  const [commentList, setCommentList] = useState([]); // 전체 댓글 목록 리스트
  const [newComment, setNewComment] = useState(""); // 새 댓글 내용
  const [isSecret, setIsSecret] = useState(false); // 비밀댓글 체크박스 상태

  // 페이지네이션용 State 추가
  const [page, setPage] = useState(0); // 현재 페이지 (0부터 시작)
  const [totalPage, setTotalPage] = useState(0); // 전체 페이지 수

  const [filterType, setFilterType] = useState("all"); // 기본값: 전체
  const [orderType, setOrderType] = useState("newest"); // 기본값: 최신순

  const filterList = [
    ["all", "전체"],
    ["normal", "일반댓글"],
    ["secret", "비밀댓글"],
  ];

  const orderList = [
    ["newest", "최신순"],
    ["oldest", "오래된순"],
  ];

  // 셀렉터 값 변경 시 1페이지로 돌아가는 함수들
  const handleFilterChange = (value) => {
    setFilterType(value);
    setPage(0);
    scrollToCommentTop();
  };

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
    if (!marketNo) {
      return;
    }

    axios
      .get(
        `${import.meta.env.VITE_BACKSERVER}/markets/${marketNo}/comments?page=${page}&filterType=${filterType}&orderType=${orderType}`,
      )
      .then((res) => {
        setCommentList(res.data.items);
        setTotalPage(res.data.totalPage);
      })
      .catch((err) => {
        console.log("댓글 로딩 실패:", err);
      });
  };

  // 페이지가 처음 켜질 때(혹은 marketNo가 바뀔 때 등) 댓글 목록 불러오기
  useEffect(() => {
    fetchComments();
  }, [marketNo, page, filterType, orderType]);

  // 댓글 작성 로직
  const submitComment = () => {
    // 회원 아이디가 없다면(로그인이 안되어 있다면) -> 현재 전체적인 로직상 뜨지않는 alert지만 누군가 개발자도구로 text, button의 disable을 지우고 댓글작성 시도를 할수도 있으니 만듬
    if (!memberId) {
      Swal.fire({
        icon: "warning",
        title: "로그인 필요",
        text: "댓글을 작성하려면 로그인해주세요.",
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
      marketNo: marketNo,
      marketCommentWriter: memberId,
      marketCommentContent: newComment,
      isSecret: isSecret ? 1 : 0, // DB에는 0(일반) 또는 1(비밀)로 들어감
      marketRecommentNo: null, // 최상위 댓글이니까 부모 번호는 null!
    };

    axios
      .post(`${import.meta.env.VITE_BACKSERVER}/markets/comments`, commentData)
      .then((res) => {
        setNewComment(""); // 입력창 비우기
        setIsSecret(false); // 비밀댓글 체크박스 풀기

        setPage(0); // 1페이지로 가기
        setFilterType("all");
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
        // 전체 댓글 중에서 '부모 번호(marketRecommentNo)'가 현재 찾고 있는 번호(parentId)랑 똑같은 애들만 걸러냄
        // 답글에서 그 답글을 어떤 댓글에 단건지 알기 위해 부모 번호로 그룹지어주기 위해서
        // 처음엔 parentId가 null이니까 최상위 댓글만 뽑아냄.
        .filter((c) => {
          return c.marketRecommentNo === parentId;
        })
        .map((comment) => (
          // 뽑아낸 데이터들을 자식 컴포넌트(CommentItem)한테 넘겨주고 화면에 그림
          <CommentItem
            key={comment.marketCommentNo}
            comment={comment} // 댓글 데이터
            memberId={memberId} // 현재 로그인한 유저
            marketWriter={marketWriter} // 게시글 작성자
            fetchComments={fetchComments} // 자식쪽에서 삭제/수정 시 화면 렌더링을 할수있게 함수도 통째로 넘겨줌
            allComments={commentList} // 자식이 자기 밑에 달린 답글 찾을 수 있게 전체 리스트도 넘겨줌
            marketNo={marketNo} // 게시글 번호
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
          {/* 일반/비밀 필터 */}
          <BasicSelect
            state={filterType}
            setState={handleFilterChange}
            list={filterList}
          />
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
          onChange={(e) => {
            setNewComment(e.target.value);
          }}
          disabled={!memberId} // memberId가 없으면(비회원이면) true가 되어 비활성화
          maxLength={1000} // 1000자 제한
        />

        <div className={styles.write_footer}>
          <label className={styles.secret_check}>
            <input
              type="checkbox"
              checked={isSecret}
              onChange={(e) => {
                setIsSecret(e.target.checked);
              }}
              disabled={!memberId} // 비회원은 체크도 못하게 막음
              maxLength={1000} // 1000자 제한 -> 개발자도구로 disable 해제할 경우를 생각해서 넣어둠
            />
            비밀댓글
          </label>

          {/* 버튼 옆에 글자 수 카운터와 묶어주기 위해 div로 감쌈 */}
          <div className={styles.write_actions}>
            {/* 글자 수 카운터 UX 추가 (1000자 꽉 차면 빨간색으로 경고!) */}
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
  marketWriter,
  fetchComments, // 부모가 준 렌더링 함수
  allComments, // 전체 댓글 리스트, commentList로 하고 싶었는데 위에서 한번 쓴 변수명이니 혹시몰라 이렇게..
  marketNo,
  memberThumb,
  hexCode,
  memberName,
}) => {
  // 답글(대댓글) 작성 관련 State
  const [showReplyInput, setShowReplyInput] = useState(false); // 답글달기 입력창 열림/닫힘 여부
  const [replyContent, setReplyContent] = useState(""); // 답글의 내용(value)
  const [isSecretReply, setIsSecretReply] = useState(false); // 답글의 비밀댓글 여부

  // 수정 관련 State
  const [isEditing, setIsEditing] = useState(false); // 수정 모드여부 확인
  const [editContent, setEditContent] = useState(comment.marketCommentContent); // 수정창에 띄울 기존댓글 내용
  const [isSecretEdit, setIsSecretEdit] = useState(comment.isSecret === 1); // 기존 비밀댓글인지 여부

  const [showReplies, setShowReplies] = useState(false); // '답글 보기' 열림/닫힘 토글

  // 권한 체크 로직
  const isMyComment = memberId === comment.marketCommentWriter; // 내가 쓴 댓글인지 (true, false 저장)
  const isPostWriter = memberId === marketWriter; // 내가 이 마켓 글쓴이(판매자)인가 (true, false 저장)

  // 조상 댓글(부모, 조부모...) 중에 내가 쓴 댓글이 있는지 추적하는 함수 (내가 쓴 비밀댓글(답글로 비밀댓글을 써도 답글의 답글이어도)의 답글들은 비밀댓글이어도 볼수 있게)
  const isMyThread = () => {
    let currentComment = comment; // 탐색하기 시작하는 현재 댓글

    // 부모 번호가 null이 아닐 때까지(최상위 부모 댓글에 도달할 때까지) 계속 위로 올라감
    while (currentComment.marketRecommentNo !== null) {
      // 내 부모 댓글을 전체 리스트에서 찾기 -> 찾아서 parentComment에 저장
      const parentComment = allComments.find(
        (c) => c.marketCommentNo === currentComment.marketRecommentNo,
      );

      // 부모가 없으면(혹시라도 DB에서 지워졌다면) 멈춤 -> 이게 없으면 혹여나 DB에서 지워지면 무한루프됨.
      if (!parentComment) break;

      // 찾은 부모(혹은 조부모...) 댓글의 작성자가 '나(memberId)'라면? -> 볼 권한 있음(true)
      if (parentComment.marketCommentWriter === memberId) {
        return true;
      }

      // 다음 반복을 위해 currentComment를 부모(parentComment)로 교체해서 한 단계 더 위로 올라감
      currentComment = parentComment;
    }

    // 끝까지 다 뒤졌는데 내가 쓴 게 하나도 없으면 권한 없음(false)
    return false;
  };

  const canViewSecret = isMyComment || isPostWriter || isMyThread(); // 비밀댓글 열람 권한: 내 댓글이거나, 내가 글쓴이(게시글 주인(작성자)), 내가 쓴 댓글에 있는 답글이면 볼 수 있음
  const isSecretComment = comment.isSecret === 1; // comment로 가져온 댓글의 비밀댓글여부(0, 1)가 비밀댓글(1)인지 true, false로 담아둠

  // 상호작용(답글/신고) 권한 체크용
  const canInteract = !isSecretComment || canViewSecret; // 비밀댓글이 아니거나, (비밀댓글이라도) 내가 볼 권한이 있다면(이 권한들로 버튼을 띄우기 위해)

  // 자식 답글들
  // 전체 댓글 리스트를 뒤져서, 부모 번호(marketRecommentNo)가 지금 내 번호(comment.marketCommentNo)랑 똑같은 애들만 필터링
  const childComments = allComments.filter((c) => {
    return c.marketRecommentNo === comment.marketCommentNo;
  });

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
            `${import.meta.env.VITE_BACKSERVER}/markets/comments/${comment.marketCommentNo}`,
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

    // 수정한 내용과 비밀댓글 여부가 기존과 완전히 똑같으면 서버 요청 안하고 바로 리턴
    if (
      editContent === comment.marketCommentContent &&
      isSecretEdit === (comment.isSecret === 1)
    ) {
      setIsEditing(false); // 수정창만 닫아버림
      return;
    }

    // 수정할 data
    const updateData = {
      marketCommentNo: comment.marketCommentNo, // 누구를 수정할 건지 PK 전송
      marketCommentContent: editContent, // 댓글의 내용
      isSecret: isSecretEdit ? 1 : 0, // 비밀 댓글 여부
    };

    axios
      .patch(`${import.meta.env.VITE_BACKSERVER}/markets/comments`, updateData)
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
      marketNo: marketNo,
      marketCommentWriter: memberId,
      marketCommentContent: replyContent,
      isSecret: isSecretReply ? 1 : 0,
      marketRecommentNo: comment.marketCommentNo, // 여기가 핵심! 부모 번호에 지금 내 번호를 넣어줘서 종속관계를 만듦!
    };

    axios
      .post(`${import.meta.env.VITE_BACKSERVER}/markets/comments`, replyData)
      .then((res) => {
        setReplyContent(""); // 답글의 내용(value) 초기화
        setIsSecretReply(false); // 작성 완료됐으니 다른 댓글에서도 비밀댓글인지 여부를 따로 따져야하니 기본값으로 초기화
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
          marketCommentNo: comment.marketCommentNo,
          memberId: memberId,
          marketCommentReportReason: result.value, // 아까 긁어온 내용
        };

        axios
          .post(
            `${import.meta.env.VITE_BACKSERVER}/markets/comments/reports`,
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

  return (
    <li className={styles.comment_item}>
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
            {timeAgo(comment.marketCommentDate)}
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
              <label className={styles.secret_check}>
                <input
                  type="checkbox"
                  checked={isSecretEdit}
                  onChange={(e) => setIsSecretEdit(e.target.checked)}
                />
                비밀댓글
              </label>

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
          <>
            {/* 비밀댓글인데 볼 권한이 없으면 자물쇠 처리 */}
            {isSecretComment && !canViewSecret ? (
              // 좌물쇠 아이콘 구글에서 복붙한거임 필요하면 다들 복붙 ㄱㄱ
              <span className={styles.secret_text}>🔒 비밀댓글입니다.</span>
            ) : (
              // 볼 권한이 있거나, 일반 댓글일 경우 렌더링
              <p>
                {/* 비밀댓글이지만 내가 볼 권한이 있어서 내용이 보이는 경우 자물쇠 아이콘만 살짝 띄워줌 */}
                {isSecretComment && (
                  <span className={`material-icons ${styles.lock_icon}`}>
                    lock
                  </span>
                )}
                {comment.marketCommentContent}
              </p>
            )}
          </>
        )}
      </div>

      {/* 푸터 영역 : 답글달기, 신고 버튼 (수정 중이 아니고 볼 권한이 있을 때만 노출) */}
      {!isEditing && canInteract && (
        <div className={styles.comment_footer}>
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
              <label className={styles.secret_check}>
                <input
                  type="checkbox"
                  checked={isSecretReply}
                  onChange={(e) => {
                    setIsSecretReply(e.target.checked);
                  }}
                />
                비밀답글
              </label>
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <span
                  style={{
                    fontSize: "13px",
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
          onClick={() => {
            setShowReplies(!showReplies);
          }}
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
          {childComments.map((childComment) => (
            // 자기가 자기 자신(CommentItem)을 또 부름 (이래서 대댓글이 계속 이어서 갈 수 있음)
            <CommentItem
              key={childComment.marketCommentNo}
              comment={childComment}
              memberId={memberId}
              marketWriter={marketWriter}
              fetchComments={fetchComments}
              allComments={allComments}
              marketNo={marketNo}
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

export default MarketComment;
