import { useNavigate, useParams } from "react-router-dom";
import styles from "./CommunityViewPage.module.css";
import { useEffect, useState } from "react";
import axios from "axios";
import useAuthStore from "../../components/utils/useAuthStore";
import Button from "../../components/ui/Button";
import Swal from "sweetalert2";
import { TextArea } from "../../components/ui/Form";

import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import VisibilityIcon from "@mui/icons-material/Visibility";

import ThumbUpAltIcon from "@mui/icons-material/ThumbUpAlt";
import ThumbUpOffAltIcon from "@mui/icons-material/ThumbUpOffAlt";
import ThumbDownAltIcon from "@mui/icons-material/ThumbDownAlt";
import ThumbDownOffAltIcon from "@mui/icons-material/ThumbDownOffAlt";
import CommunityComment from "../../components/community/CommunityComment";
import Nickname from "../../components/commons/Nickname";
const CommunityViewPage = () => {
  const navigate = useNavigate();
  const params = useParams();
  const communityNo = params.communityNo;
  const { memberId, isReady } = useAuthStore();
  const [community, setCommunity] = useState(null);

  useEffect(() => {
    if (!isReady) {
      return;
    }
    axios
      .get(`${import.meta.env.VITE_BACKSERVER}/communities/${communityNo}`)
      .then((res) => {
        setCommunity(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [isReady]);
  const deleteCommunity = () => {
    Swal.fire({
      title: "게시글을 삭제하시겠습니까?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "네",
      cancelButtonText: "아니오",
      confirmButtonColor: "var(--danger)",
      cancelButtonColor: "var(--primary)",
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .delete(
            `${import.meta.env.VITE_BACKSERVER}/communities/${communityNo}`,
          )
          .then((res) => {
            if (res.data === 1) {
              Swal.fire("삭제 성공", "게시글이 삭제되었습니다.", "success");
              navigate("/community");
            }
          })
          .catch((err) => {
            console.log(err);
          });
      }
    });
  };
  return (
    <section className={styles.community_wrap}>
      {community && (
        <>
          <div className={styles.community_view_wrap}>
            <div className={styles.community_view_header}>
              <h2 className={styles.community_title}>
                {community.communityTitle}
              </h2>
              <div className={styles.community_sub_info}>
                <div className={styles.community_writer}>
                  <div
                    className={
                      community.memberThumb
                        ? styles.member_thumb_exists
                        : styles.member_thumb
                    }
                  >
                    {community.memberThumb ? (
                      <img
                        src={`${import.meta.env.VITE_BACKSERVER}/semi/${community.memberThumb}`}
                      ></img>
                    ) : (
                      <span className="material-icons">account_circle</span>
                    )}
                  </div>
                  <Nickname member={community} />
                </div>
                <div className={styles.community_date}>
                  <CalendarMonthIcon className={styles.icon} />
                  <span>{community.communityDate}</span>
                </div>
                <div className={styles.community_view_count}>
                  <VisibilityIcon className={styles.icon} />
                  <span>{community.viewCount}</span>
                </div>
              </div>
            </div>
            <div
              className={styles.community_view_content}
              dangerouslySetInnerHTML={{ __html: community.communityContent }}
            ></div>
          </div>
          <div className={styles.community_action_btn_wrap}>
            {memberId && memberId === community.communityWriter && (
              <div className={styles.left}>
                <div className={styles.button_group}>
                  <Button
                    className="btn primary"
                    onClick={() => {
                      navigate(`/community/modify/${community.communityNo}`);
                    }}
                  >
                    수정
                  </Button>
                  <Button
                    className="btn primary outline"
                    onClick={deleteCommunity}
                  >
                    삭제
                  </Button>
                </div>
              </div>
            )}
            <div className={styles.right}>
              <LikeAndDislikeAndReport
                communityNo={communityNo}
                communityWriter={community.communityWriter}
              />
            </div>
          </div>
          <CommunityComment communityNo={communityNo} memberId={memberId} />
        </>
      )}
    </section>
  );
};
const LikeAndDislikeAndReport = ({ communityNo, communityWriter }) => {
  const { memberId } = useAuthStore();
  const [likeInfo, setLikeInfo] = useState(null);
  const [dislikeInfo, setDislikeInfo] = useState(null);
  const [reportInfo, setReportInfo] = useState(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const handleCloseModal = () => {
    // 내용이 있으면 경고
    if (reportReason.trim() !== "") {
      Swal.fire({
        title: "작성 중인 내용이 있습니다.",
        text: "네를 누르면 작성 중인 내용이 사라집니다.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "네",
        cancelButtonText: "아니오",
        confirmButtonColor: "var(--danger)",
        cancelButtonColor: "var(--primary)",
      }).then((result) => {
        if (result.isConfirmed) {
          setReportReason(""); // 내용 초기화
          setIsReportModalOpen(false);
        }
      });
    } else {
      // 내용 없으면 그냥 닫기
      setIsReportModalOpen(false);
    }
  };
  useEffect(() => {
    axios
      .get(
        `${import.meta.env.VITE_BACKSERVER}/communities/${communityNo}/likes`,
      )
      .then((res) => {
        setLikeInfo({
          isLike: res.data?.isLike ?? 0,
          likeCount: Number(res.data?.likeCount) || 0,
        });
      });
    axios
      .get(
        `${import.meta.env.VITE_BACKSERVER}/communities/${communityNo}/dislikes`,
      )
      .then((res) => {
        setDislikeInfo({
          isDislike: res.data?.isDislike ?? 0,
          dislikeCount: Number(res.data?.dislikeCount) || 0,
        });
      });
    axios
      .get(
        `${import.meta.env.VITE_BACKSERVER}/communities/${communityNo}/reports`,
      )
      .then((res) => {
        setReportInfo({
          isReport: res.data?.isReport ?? 0,
          reportCount: Number(res.data?.reportCount) || 0,
        });
      });
  }, []);
  const likeOn = () => {
    axios
      .post(
        `${import.meta.env.VITE_BACKSERVER}/communities/${communityNo}/likes`,
      )
      .then((res) => {
        if (res.data === 1) {
          setLikeInfo({
            ...likeInfo,
            isLike: 1,
            likeCount: likeInfo.likeCount + 1,
          });
          if (dislikeInfo?.isDislike === 1) {
            setDislikeInfo({
              isDislike: 0,
              dislikeCount: dislikeInfo.dislikeCount - 1,
            });
          }
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const likeOff = () => {
    axios
      .delete(
        `${import.meta.env.VITE_BACKSERVER}/communities/${communityNo}/likes`,
      )
      .then((res) => {
        if (res.data === 1) {
          setLikeInfo({
            ...likeInfo,
            isLike: 0,
            likeCount: likeInfo.likeCount - 1,
          });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const dislikeOn = () => {
    axios
      .post(
        `${import.meta.env.VITE_BACKSERVER}/communities/${communityNo}/dislikes`,
      )
      .then((res) => {
        if (res.data === 1) {
          setDislikeInfo({
            ...dislikeInfo,
            isDislike: 1,
            dislikeCount: dislikeInfo.dislikeCount + 1,
          });
          if (likeInfo?.isLike === 1) {
            setLikeInfo({
              isLike: 0,
              likeCount: likeInfo.likeCount - 1,
            });
          }
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const dislikeOff = () => {
    axios
      .delete(
        `${import.meta.env.VITE_BACKSERVER}/communities/${communityNo}/dislikes`,
      )
      .then((res) => {
        if (res.data === 1) {
          setDislikeInfo({
            ...dislikeInfo,
            isDislike: 0,
            dislikeCount: dislikeInfo.dislikeCount - 1,
          });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const loginMsg = () => {
    Swal.fire({ title: "로그인 후 이용 가능합니다.", icon: "info" });
  };
  const handleReportClick = () => {
    if (!memberId) {
      loginMsg();
      return;
    }
    if (reportInfo?.isReport === 1) {
      Swal.fire({
        title: "이미 신고된 게시물입니다.",
        icon: "warning",
      });
      return;
    }
    setIsReportModalOpen(true);
  };
  const submitReport = () => {
    if (reportReason.trim() === "") {
      Swal.fire("신고 사유를 입력해주세요.", "", "warning");
      return;
    }
    Swal.fire({
      title: "해당 게시글을 \n 정말로 신고하시겠습니까?",
      text: "신고 후에는 취소할 수 없습니다.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "네",
      cancelButtonText: "아니오",
      confirmButtonColor: "var(--danger)",
      cancelButtonColor: "var(--primary)",
    }).then((result) => {
      if (!result.isConfirmed) return;
      axios
        .post(
          `${import.meta.env.VITE_BACKSERVER}/communities/${communityNo}/reports`,
          {
            reportReason: reportReason,
          },
        )
        .then((res) => {
          if (res.data === 1) {
            setReportInfo({
              ...reportInfo,
              isReport: 1,
              reportCount: reportInfo.reportCount + 1,
            });
            Swal.fire("신고가 접수되었습니다.", "", "success");
            setIsReportModalOpen(false);
            setReportReason("");
          }
        })
        .catch((err) => console.log(err));
    });
  };
  return (
    <div className={styles.community_like_dislike_report_wrap}>
      {likeInfo && (
        <div
          className={`${styles.community_like_wrap} ${
            likeInfo.isLike === 1 ? styles.like_active : ""
          }`}
        >
          {likeInfo.isLike === 1 ? (
            <ThumbUpAltIcon onClick={likeOff} />
          ) : (
            <ThumbUpOffAltIcon onClick={memberId ? likeOn : loginMsg} />
          )}
          <span>{likeInfo.likeCount}</span>
        </div>
      )}
      {dislikeInfo && (
        <div
          className={`${styles.community_dislike_wrap} ${
            dislikeInfo.isDislike === 1 ? styles.dislike_active : ""
          }`}
        >
          {dislikeInfo.isDislike === 1 ? (
            <ThumbDownAltIcon onClick={dislikeOff} />
          ) : (
            <ThumbDownOffAltIcon onClick={memberId ? dislikeOn : loginMsg} />
          )}
          <span>{dislikeInfo.dislikeCount}</span>
        </div>
      )}

      {memberId !== communityWriter && (
        <div className={styles.center}>
          <Button className="btn danger" onClick={handleReportClick}>
            신고하기
          </Button>
        </div>
      )}
      {isReportModalOpen && (
        <div
          className={styles.overlay}
          // onClick={() => setIsReportModalOpen(false)}
        >
          <div
            className={styles.report_modal}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>게시글 신고하기</h3>
            <TextArea
              placeholder="신고 사유를 입력해주세요 (최대 1,000자 입력 가능)"
              value={reportReason}
              maxLength={1000}
              onChange={(e) => {
                const value = e.target.value;

                setReportReason(value);
              }}
            />
            <div
              className={`${styles.text_count} ${
                reportReason.length >= 1000 ? styles.limit : ""
              }`}
            >
              {reportReason.length} / 1000
            </div>

            <div className={styles.modal_btn_wrap}>
              <Button className="btn danger" onClick={submitReport}>
                신고
              </Button>
              <Button className="btn light outline" onClick={handleCloseModal}>
                취소
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default CommunityViewPage;
