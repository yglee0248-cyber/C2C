import styles from "./MarketViewPage.module.css";
import Button from "../../components/ui/Button";
import useAuthStore from "../../components/utils/useAuthStore";
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import ImageList from "@mui/material/ImageList";
import ImageListItem from "@mui/material/ImageListItem";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import MarketComment from "../../components/market/MarketComment";
import { Modal, Box, IconButton } from "@mui/material"; // IconButton 추가
import { ChevronLeft, ChevronRight, Close } from "@mui/icons-material";
import MarketMap from "../../components/market/MarketMap";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PersonIcon from "@mui/icons-material/Person";
import FavoriteIcon from "@mui/icons-material/Favorite";
import Nickname from "../../components/commons/Nickname";

const MarketViewPage = () => {
  const navigate = useNavigate();
  const { memberId, isReady } = useAuthStore();
  const params = useParams();
  const marketNo = params.marketNo;
  const MySwal = withReactContent(Swal);
  const [market, setMarket] = useState(null);
  const imgUrl = "http://192.168.31.24:9999/market";

  const images = market?.fileList || [];

  const [bannerIndex, setBannerIndex] = useState(0); // 현재 화면에 보여지는 배너 이미지의 인덱스(순서)를 기억하는 state

  // 이전 이미지 버튼용 (첫 사진에서 누르면 마지막 사진으로 루프되도록 처리)
  const prevBanner = (e) => {
    // e.stopPropagation(): 화살표 클릭 시 모달창이 열리는 등 부모 요소의 클릭 이벤트가 실행되는 것을 방지
    e.stopPropagation();
    setBannerIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  // 다음 이미지 버튼용 (마지막 사진에서 누르면 첫 사진으로 루프되도록 처리)
  const nextBanner = (e) => {
    e.stopPropagation();
    setBannerIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  /* 거래요청 리스트용 스테이트 */
  const [tradeRequestList, setTradeRequestList] = useState([]);

  /*금액 함수*/
  const formatPrice = (price) => {
    if (price === 0) {
      return "무료나눔";
    }
    return price.toLocaleString() + "원"; // toLocaleString하면 현재 본인의 국가에 해당하는 숫자 표기법을 적용 (예 : 1000000 -> 1,000,000)
  };

  /* 게시글 불러오기 */
  useEffect(() => {
    if (!isReady) return;
    axios
      .get(`${import.meta.env.VITE_BACKSERVER}/markets/${marketNo}`, {
        withCredentials: true,
      })
      .then((res) => {
        //console.log(res.data.data);
        if (res.data.success) {
          setMarket(res.data.data);
        } else {
          console.log(res.data);
          Swal.fire({
            title: res.data.message,
            icon: "warning",
            confirmButtonText: "닫기",
          }).then(() => {
            navigate("/market");
          });
        }
      })
      .catch((err) => {
        console.log(err);
        Swal.fire({
          title: "오류발생,콘솔확인",
          icon: "error",
        });
      });
  }, [memberId, marketNo, isReady, tradeRequestList]);

  /* 거래요청 함수 */
  const requestTrade = () => {
    Swal.fire({
      title: "거래요청하기",
      html: `
            <textarea id="report-reason" class="swal2-textarea" 
              placeholder="거래요청 메시지를 남겨주세요. (최대 100자)" 
              maxlength="100" 
              style="width: 85%; height: 100px; resize: none; font-size: 14px; margin-top: 10px;"></textarea>
            <div id="report-counter" style="text-align: right; width: 85%; margin: 5px auto 0; font-size: 13px; color: var(--gray4);">
              0/100
            </div>
          `,
      showCancelButton: true,
      confirmButtonText: "네",
      cancelButtonText: "아니오",
      confirmButtonColor: "var(--primary)",
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
          counter.innerText = `${currentLength}/100`;

          // 1000자가 꽉 차면 빨간색으로 변경
          if (currentLength >= 100) {
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
          Swal.showValidationMessage("요청 메시지를 남겨주세요."); // 빈칸이면 못 넘어가게 막기

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
      if (result.isConfirmed) {
        const requestData = {
          marketNo: marketNo,
          buyerId: memberId,
          message: result.value, // 아까 긁어온 내용
        };

        axios
          .post(
            `${import.meta.env.VITE_BACKSERVER}/markets/${marketNo}/request`,
            requestData,
          )
          .then((res) => {
            //console.log(res);
            if (res.data === 1) {
              setMarket({ ...market, isRequest: 1 });
              Swal.fire({
                icon: "success",
                title: "거래요청완료",
                confirmButtonText: "닫기",
                confirmButtonColor: "var(--primary)",
              });
            }
          })
          .catch((err) => {
            console.log(err);
          });
      }
    });
  };

  /* 거래 요청취소 함수 */
  const cancelTrade = () => {
    Swal.fire({
      title: "거래요청 취소 하시겠습니까?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "네",
      cancelButtonText: "아니오",
      confirmButtonColor: "var(--primary)",
      cancelButtonColor: "var(--danger)",
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .delete(
            `${import.meta.env.VITE_BACKSERVER}/markets/${marketNo}/request`,
          )
          .then((res) => {
            if (res.data === 1) {
              setMarket({ ...market, isRequest: 0 });
              Swal.fire({
                icon: "success", // 성공 아이콘 (체크 표시)
                title: "취소완료",
                confirmButtonText: "닫기",
                confirmButtonColor: "var(--primary)",
              });
            }
          })
          .catch((err) => {
            //console.log("거래요청취소 실패");
            console.log(err);
          });
      }
    });
  };

  /* 게시글 수정 함수 */
  const modifyMarket = () => {
    navigate(`/market/modify/${marketNo}`);
  };
  /* 게시글 삭제 함수 */
  const deleteMarket = () => {
    Swal.fire({
      title: "삭제 하시겠습니까?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "네",
      cancelButtonText: "아니오",
      confirmButtonColor: "var(--primary)",
      cancelButtonColor: "var(--danger)",
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .delete(`${import.meta.env.VITE_BACKSERVER}/markets/${marketNo}`)
          .then((res) => {
            //console.log(res.data);
            const { fileCount, allDeleted, result } = res.data;

            Swal.fire({
              title: "게시물 삭제확인",
              html: `
              게시글 삭제: ${result === 1 ? "성공" : "실패"}<br/>
              삭제된 파일 수: ${fileCount}개<br/>
              파일 전체 삭제 여부: ${allDeleted ? "성공" : "일부실패"}
              `,
              icon: result === 1 ? "success" : "error",
              confirmButtonText: "닫기",
              confirmButtonColor: "pink",
            }).then((result) => {
              if (result.isConfirmed) {
                navigate("/market");
              }
            });
          })
          .catch((err) => {
            console.log(err);
          });
      }
    });
  };

  /* 거래완료버튼 클릭시 요청리스트 띄우기 */
  const tradeComplete = () => {
    console.log(market.marketNo);
    axios
      .get(`${import.meta.env.VITE_BACKSERVER}/markets/${marketNo}/requests`)
      .then((res) => {
        //console.log("거래요청리스트 호출 성공");
        //console.log(res);
        setTradeRequestList(res.data);
        if (res.data.length === 0) {
          MySwal.fire({
            title: "알림",
            text: "대기 중인 거래 요청이 없습니다.",
            icon: "info",
            confirmButtonText: "닫기",
            confirmButtonColor: "var(--primary)",
          });
          return;
        }
        MySwal.fire({
          title: "거래 요청 목록",
          html: `
    <ul class="trade_ul">
      ${res.data
        .map(
          (trade) => `
        <li class="trade_li">
          <p class="trade_buyerId">${trade.buyerId}</p>
          <p class="trade_message">${trade.message}</p>
          <button class="trade_btn" data-id="${trade.buyerId}">
            거래 확정
          </button>
        </li>
      `,
        )
        .join("")}
    </ul>
  `,
          didOpen: () => {
            document.querySelectorAll(".trade_btn").forEach((btn) => {
              btn.addEventListener("click", (e) => {
                const buyerId = e.target.dataset.id;
                MySwal.close();
                requestAccepted(buyerId);
              });
            });
          },
          width: "900px",
          showConfirmButton: false,
          showCloseButton: true,
        });
      })

      .catch((err) => {
        console.log(err);
      });
  };
  /* 거래 확정 함수 */
  const requestAccepted = (buyerId) => {
    //console.log(buyerId);
    Swal.fire({
      title: `${buyerId} 님과 거래완료 하시겠습니까?`,
      icon: "question",
      width: "720px",
      showCancelButton: true,
      confirmButtonText: "확정",
      cancelButtonText: "취소",
      confirmButtonColor: "var(--primary)",
      cancelButtonColor: "var(--danger)",
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .patch(
            `${import.meta.env.VITE_BACKSERVER}/markets/${marketNo}/requests/${buyerId}`,
          )
          .then((res) => {
            //console.log(res.data);
            if (res.data > 1) {
              Swal.fire({
                icon: "success", // 성공 아이콘 (체크 표시)
                title: "거래가 완료되었습니다",
                confirmButtonText: "닫기",
                confirmButtonColor: "var(--primary)",
              });

              axios.delete(
                `${import.meta.env.VITE_BACKSERVER}/chat/room/private/${marketNo}`,
              );

              navigate("/market");
            }
          })
          .catch((err) => {
            //console.log("거래확정실패");
            console.log(err);
          });
      }
    });
  };
  /* 좋아요 함수 */
  const likeOn = () => {
    axios
      .post(`${import.meta.env.VITE_BACKSERVER}/markets/${marketNo}/likes`)
      .then((res) => {
        if (res.data === 1) {
          setMarket({ ...market, isLike: 1, likeCount: market.likeCount + 1 });
        }
      })
      .catch((err) => console.log(err));
  };
  /* 좋아요 취소 함수 */
  const likeOff = () => {
    axios
      .delete(`${import.meta.env.VITE_BACKSERVER}/markets/${marketNo}/likes`)
      .then((res) => {
        if (res.data === 1) {
          setMarket({ ...market, isLike: 0, likeCount: market.likeCount - 1 });
        }
      })
      .catch((err) => console.log(err));
  };
  /* 로그인이 필요합니다 */
  const loginMsg = () => {
    Swal.fire("알림", "로그인 후 이용 가능합니다.", "info");
    navigate("/member/login");
  };
  /*신고하기 함수*/
  const pushReport = () => {
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
          marketNo: marketNo,
          memberId: memberId,
          marketReportReason: result.value, // 아까 긁어온 내용
        };

        axios
          .post(
            `${import.meta.env.VITE_BACKSERVER}/markets/${marketNo}/reports`,
            reportData,
          )
          .then((res) => {
            if (res.data === 1) {
              setMarket({ ...market, isReport: 1 });
              Swal.fire({
                icon: "success",
                title: "신고완료",
                confirmButtonText: "닫기",
                confirmButtonColor: "var(--primary)",
              });
            }
          })
          .catch((err) => {
            console.log(err);
          });
      }
    });
  };

  /*신고취소 함수*/
  const cancelReport = () => {
    Swal.fire({
      title: "신고내역을 취소 하시겠습니까?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "네",
      cancelButtonText: "아니오",
      confirmButtonColor: "var(--danger)",
      cancelButtonColor: "var(--primary)",
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .delete(
            `${import.meta.env.VITE_BACKSERVER}/markets/${marketNo}/reports`,
          )
          .then((res) => {
            //console.log(res.data);
            if (res.data === 1) {
              setMarket({ ...market, isReport: 0 });
              Swal.fire({
                icon: "success", //
                title: "신고가 취소되었습니다",
                confirmButtonText: "닫기",
                confirmButtonColor: "var(--primary)",
              });
            }
          })
          .catch((err) => {
            //console.log("신고취소 실패");
            console.log(err);
          });
      }
    });
  };

  /*채팅하기 함수*/
  const startChat = () => {
    // 기존의 채팅방이 있으면 return 받고, 없으면 새롭게 생성된 roomId return
    axios
      .post(
        `${import.meta.env.VITE_BACKSERVER}/chat/room/private/create?otherMemberId=${market.marketWriter}&marketNo=${market.marketNo}`,
      )
      .then((res) => {
        const roomId = res.data;
        navigate(`/chatpage/${roomId}`);
      });
  };

  return (
    <main className={styles.main_wrap}>
      {market && (
        <>
          <div className={styles.photo_wrap}>
            <div className={styles.banner_container}>
              <img
                src={`${imgUrl}/${images[bannerIndex]?.marketFilePath}`}
                alt="상품 이미지"
                className={styles.banner_image}
              />

              {/* 화살표 띄움 */}
              <div className={styles.banner_btn_wrap}>
                <button onClick={prevBanner}>
                  <span className="material-icons">chevron_left</span>
                </button>
                <button onClick={nextBanner}>
                  <span className="material-icons">chevron_right</span>
                </button>
              </div>

              {/* 이미지 개수 표시 */}
              <div className={styles.banner_counter}>
                {bannerIndex + 1} / {images.length}
              </div>
            </div>

            {/* 이미지 상세 모달 */}
          </div>
          <div className={styles.wrap1}>
            <div className={styles.wrap1_title}>
              <p className={styles.wrap1_title_in}>{market.marketTitle}</p>
            </div>
            <div className={styles.wrap1_info}>
              <div className={styles.wrap1_thumb}>
                <div
                  className={
                    market.memberThumb
                      ? styles.member_thumb_exists
                      : styles.member_thumb
                  }
                >
                  {market.memberThumb ? (
                    <img
                      src={`${import.meta.env.VITE_BACKSERVER}/semi/${market.memberThumb}`}
                    ></img>
                  ) : (
                    <span className="material-icons">account_circle</span>
                  )}
                </div>
                <Nickname member={market} />
              </div>

              <div className={styles.wrap2}>
                <div className={styles.wrap2_1}>
                  <div className={styles.wrap1_date}>
                    <CalendarMonthIcon className={styles.date_icon} />
                    <p>{market.marketDate.slice(0, 16)}</p>
                  </div>

                  <div className={styles.wrap1_like}>
                    <FavoriteIcon className={styles.like_icon} />
                    <p>{market.likeCount}</p>
                  </div>
                </div>
                <div className={styles.wrap2_2}>
                  <div className={styles.wrap1_price}>
                    <p
                      className={
                        market.sellPrice === 0
                          ? styles.title_price_free
                          : styles.title_price
                      }
                    >
                      {formatPrice(market.sellPrice)}
                    </p>
                  </div>
                  <div className={styles.wrap1_view}>
                    <VisibilityIcon className={styles.view_icon} />
                    <p>{market.viewCount}</p>
                  </div>
                </div>
              </div>
            </div>

            <div
              className={styles.wrap1_content}
              dangerouslySetInnerHTML={{ __html: market.marketContent }}
            ></div>
          </div>

          {(!memberId || memberId !== market.marketWriter) && (
            <div className={styles.title_btn}>
              {memberId ? (
                <>
                  {market.completed === 0 && (
                    <>
                      {/*거래요청 버튼*/}
                      {market.isRequest === 0 && (
                        <Button className="btn primary" onClick={requestTrade}>
                          거래요청
                        </Button>
                      )}
                      {market.isRequest === 1 && (
                        <Button
                          className="btn primary"
                          onClick={cancelTrade}
                          style={{
                            backgroundColor: "var(--gray8)",
                            fontWeight: "900",
                            color: "var(--primary)",
                          }}
                        >
                          요청취소
                        </Button>
                      )}
                    </>
                  )}
                  {/*좋아요 버튼*/}
                  {market.isLike === 0 ? (
                    <Button
                      className="btn primary"
                      style={{
                        backgroundColor: "var(--pink1)",
                        color: "white",
                        border: "1px solid var(--pink1)",
                      }}
                      onClick={likeOn}
                    >
                      좋아요
                    </Button>
                  ) : (
                    <Button
                      className="btn primary"
                      style={{
                        backgroundColor: "white",
                        color: "var(--pink1)",
                        fontWeight: "900",
                        border: "1px solid var(--pink1)",
                      }}
                      onClick={likeOff}
                    >
                      좋아요 취소
                    </Button>
                  )}
                  {/*신고하기 버튼*/}
                  {market.isReport === 0 ? (
                    <Button
                      className="btn primary"
                      style={{
                        backgroundColor: "var(--danger)",
                        color: "white",
                        border: "1px solid var(--danger)",
                      }}
                      onClick={pushReport}
                    >
                      신고하기
                    </Button>
                  ) : (
                    <Button
                      className="btn primary"
                      style={{
                        backgroundColor: "white",
                        color: "var(--danger)",
                        fontWeight: "900",
                        border: "1px solid var(--danger)",
                      }}
                      onClick={cancelReport}
                    >
                      신고취소
                    </Button>
                  )}
                  {/*채팅하기 버튼*/}
                  <Button className="btn primary" onClick={startChat}>
                    채팅하기
                  </Button>
                </>
              ) : (
                <Button
                  className="btn primary"
                  onClick={loginMsg}
                  style={{ width: "200px" }}
                >
                  거래요청(로그인필요)
                </Button>
              )}
            </div>
          )}
          <MarketMap market={market} />
          {memberId &&
            memberId === market.marketWriter &&
            market.completed === 0 && (
              <div className={styles.button_wrap}>
                <Button className="btn primary" onClick={modifyMarket}>
                  수정
                </Button>
                <Button className="btn primary danger" onClick={deleteMarket}>
                  삭제
                </Button>
                <Button
                  className="btn primary"
                  style={{ backgroundColor: "var(--pink1)", border: "none" }}
                  onClick={tradeComplete}
                >
                  거래완료
                </Button>
              </div>
            )}
          <MarketComment
            marketNo={marketNo}
            memberId={memberId}
            marketWriter={market.marketWriter}
          />
        </>
      )}
    </main>
  );
};

export default MarketViewPage;
