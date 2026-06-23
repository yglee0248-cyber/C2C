import { useEffect, useState } from "react";
import styles from "./Mypage.module.css";
import { NavLink, Route, Routes, useNavigate } from "react-router-dom";
import MemberInfo from "../../components/mypage/MemberInfo";
import MyCommunityPage from "../../components/mypage/MyCommunityPage";
import Swal from "sweetalert2";
import useAuthStore from "../../components/utils/useAuthStore";
import ChangePw from "../../components/mypage/ChangePw";
import MyMarketPage from "../../components/mypage/MyMarketPage";
import MyCommunityCommentPage from "../../components/mypage/MyCommunityCommentPage";
import MyMarketCommentPage from "../../components/mypage/MyMarketCommentPage";
import LikeDislike from "../../components/mypage/LikeDislike";
import TradeStatus from "../../components/mypage/TradeStatus";
import MemberManagement from "../../components/mypage/MemberManagement";
import MemberInfoManagement from "../../components/mypage/MemberInfoManagement";
import CarbonContribution from "../../components/mypage/CarbonContribution";
import MypageMain from "../../components/mypage/MypageMain";
import ColorShop from "../../components/mypage/ColorShop";
import axios from "axios";
import Nickname from "../../components/commons/Nickname";
const Mypage = () => {
  const navigate = useNavigate();
  const { memberId, isReady, isNotLogout } = useAuthStore();

  if (isReady && memberId == null && !isNotLogout) {
    Swal.fire({
      title: "로그인 후 이용 가능합니다.",
      icon: "warning",
    }).then(() => {
      navigate("/member/login");
    });
    return;
  }

  window.scrollTo(0, 0); //페이지 이동 시 항상 가장 맨 위 화면으로

  return (
    memberId && (
      <div className={styles.mypage_wrap}>
        <div className={styles.sidebar_wrap}>
          <Profile></Profile>
          <SideBar></SideBar>
        </div>
        <div className={styles.mypage_content}>
          <Routes>
            <Route path="/" element={<MypageMain />} />
            <Route path="myinfo" element={<MemberInfo />} />
            <Route path="likedislike/:type" element={<LikeDislike />} />
            <Route
              path="market/:isAdminMode"
              element={<MyMarketPage />}
            ></Route>
            <Route
              path="community/:isAdminMode"
              element={<MyCommunityPage />}
            ></Route>
            <Route
              path="marketcomment/:isAdminMode"
              element={<MyMarketCommentPage />}
            ></Route>
            <Route
              path="communitycomment/:isAdminMode"
              element={<MyCommunityCommentPage />}
            ></Route>
            <Route path="pw" element={<ChangePw />} />
            <Route path="tradestatus" element={<TradeStatus />} />
            <Route path="member-management" element={<MemberManagement />} />
            <Route path="member-management">
              <Route index element={<MemberManagement />} />
              <Route path=":memberId" element={<MemberInfoManagement />} />
            </Route>
            <Route
              path="carbon-contribution"
              element={<CarbonContribution />}
            ></Route>
            <Route path="color-shop" element={<ColorShop />}></Route>
          </Routes>
        </div>
      </div>
    )
  );
};

const Profile = () => {
  const { memberId, memberName, memberThumb, hexCode } = useAuthStore();
  const [member, setMember] = useState();

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BACKSERVER}/members/${memberId}`)
      .then((res) => {
        setMember(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  return (
    <section className={styles.sidebar}>
      <div
        className={
          memberThumb ? styles.member_thumb_exists : styles.member_thumb
        }
      >
        {memberThumb ? ( //여기확인
          <img src={`${import.meta.env.VITE_BACKSERVER}/semi/${memberThumb}`} />
        ) : (
          <span className="material-icons">account_circle</span>
        )}
      </div>
      <div className={styles.profile_info}>
        <p
          style={{
            color: hexCode || "#000",
          }}
        >
          {memberName}
        </p>
        <p
          style={{
            color: hexCode || "#000",
          }}
        >
          {memberId}
        </p>
      </div>
    </section>
  );
};

const SideBar = () => {
  const { memberGrade } = useAuthStore();
  const [selectMenu, setSelectMenu] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);
  const toggleMenu = (menu) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };
  return (
    <section className={styles.sidebar}>
      <ul className={styles.normal_menu}>
        <NavLink to="/member/mypage/myinfo">
          <li
            className={selectMenu === "myinfo" ? styles.active : ""}
            onClick={() => {
              setSelectMenu("myinfo");
              setOpenMenu(null);
            }}
          >
            내 정보
          </li>
        </NavLink>
        <NavLink to="/member/mypage/pw">
          <li
            className={selectMenu === "pw" ? styles.active : ""}
            onClick={() => {
              setSelectMenu("pw");
              setOpenMenu(null);
            }}
          >
            비밀번호 변경
          </li>
        </NavLink>

        <li
          className={
            selectMenu === "myaction" ||
            selectMenu === "myaction_like" ||
            selectMenu === "myaction_dislike" ||
            selectMenu === "myaction_report"
              ? styles.active
              : ""
          }
        >
          <div
            className={styles.menu_title}
            onClick={() => {
              toggleMenu("myaction");
              setSelectMenu("myaction");
            }}
          >
            <span
              className={`material-icons ${styles.arrow} ${
                openMenu === "myaction" ? styles.rotate : ""
              }`}
            >
              chevron_right
            </span>
            활동 내역
          </div>
          <ul className={openMenu === "myaction" ? styles.open : ""}>
            <NavLink to={`/member/mypage/likedislike/1`}>
              <li
                className={selectMenu === "myaction_like" ? styles.active : ""}
                onClick={() => setSelectMenu("myaction_like")}
              >
                좋아요
              </li>
            </NavLink>
            <NavLink to={`/member/mypage/likedislike/2`}>
              <li
                className={
                  selectMenu === "myaction_dislike" ? styles.active : ""
                }
                onClick={() => setSelectMenu("myaction_dislike")}
              >
                싫어요
              </li>
            </NavLink>
            <NavLink to={`/member/mypage/likedislike/3`}>
              <li
                className={
                  selectMenu === "myaction_report" ? styles.active : ""
                }
                onClick={() => setSelectMenu("myaction_report")}
              >
                신고
              </li>
            </NavLink>
          </ul>
        </li>
        <li
          className={
            selectMenu === "postManagement" ||
            selectMenu === "postManagement_trade" ||
            selectMenu === "postManagement_community"
              ? styles.active
              : ""
          }
        >
          <div
            className={styles.menu_title}
            onClick={() => {
              toggleMenu("postManagement");
              setSelectMenu("postManagement");
            }}
          >
            <span
              className={`material-icons ${styles.arrow} ${
                openMenu === "postManagement" ? styles.rotate : ""
              }`}
            >
              chevron_right
            </span>
            게시글 관리
          </div>
          <ul className={openMenu === "postManagement" ? styles.open : ""}>
            <NavLink to={`/member/mypage/market/${false}`}>
              <li
                className={
                  selectMenu === "postManagement_trade" ? styles.active : ""
                }
                onClick={() => setSelectMenu("postManagement_trade")}
              >
                거래
              </li>
            </NavLink>
            <NavLink to={`/member/mypage/community/${false}`}>
              <li
                className={
                  selectMenu === "postManagement_community" ? styles.active : ""
                }
                onClick={() => setSelectMenu("postManagement_community")}
              >
                커뮤니티
              </li>
            </NavLink>
          </ul>
        </li>
        <li
          className={
            selectMenu === "commentManagement" ||
            selectMenu === "commentManagement_trade" ||
            selectMenu === "commentManagement_community"
              ? styles.active
              : ""
          }
        >
          <div
            className={styles.menu_title}
            onClick={() => {
              toggleMenu("commentManagement");
              setSelectMenu("commentManagement");
            }}
          >
            <span
              className={`material-icons ${styles.arrow} ${
                openMenu === "commentManagement" ? styles.rotate : ""
              }`}
            >
              chevron_right
            </span>
            댓글 관리
          </div>
          <ul className={openMenu === "commentManagement" ? styles.open : ""}>
            <NavLink to={`/member/mypage/marketcomment/${false}`}>
              <li
                className={
                  selectMenu === "commentManagement_trade" ? styles.active : ""
                }
                onClick={() => setSelectMenu("commentManagement_trade")}
              >
                거래
              </li>
            </NavLink>
            <NavLink to={`/member/mypage/communitycomment/${false}`}>
              <li
                className={
                  selectMenu === "commentManagement_community"
                    ? styles.active
                    : ""
                }
                onClick={() => setSelectMenu("commentManagement_community")}
              >
                커뮤니티
              </li>
            </NavLink>
          </ul>
        </li>
        <NavLink to="/member/mypage/carbon-contribution">
          <li
            onClick={() => {
              setSelectMenu("carbonContribution");
              setOpenMenu(null);
            }}
            className={selectMenu === "carbonContribution" ? styles.active : ""}
          >
            나의 탄소 기여도
          </li>
        </NavLink>
        <NavLink to="/member/mypage/color-shop">
          <li
            onClick={() => {
              setSelectMenu("colorShop");
              setOpenMenu(null);
            }}
            className={selectMenu === "colorShop" ? styles.active : ""}
          >
            닉네임 색상 상점
          </li>
        </NavLink>
      </ul>
      {memberGrade !== 3 && (
        <ul className={styles.management}>
          <li>관리 페이지</li>
          <NavLink to="/member/mypage/member-management">
            <li
              onClick={() => {
                setSelectMenu("memberManagement");
                setOpenMenu(null);
              }}
              className={selectMenu === "memberManagement" ? styles.active : ""}
            >
              회원 관리
            </li>
          </NavLink>
          <li
            className={
              selectMenu === "postManagement_admin" ||
              selectMenu === "postManagement_trade_admin" ||
              selectMenu === "postManagement_community_admin"
                ? styles.active
                : ""
            }
          >
            <div
              className={styles.menu_title}
              onClick={() => {
                toggleMenu("postManagement_admin");
                setSelectMenu("postManagement_admin");
              }}
            >
              <span
                className={`material-icons ${styles.arrow} ${
                  openMenu === "postManagement" ? styles.rotate : ""
                }`}
              >
                chevron_right
              </span>
              게시글 관리
            </div>
            <ul
              className={openMenu === "postManagement_admin" ? styles.open : ""}
            >
              <NavLink to={`/member/mypage/market/${true}`}>
                <li
                  className={
                    selectMenu === "postManagement_trade_admin"
                      ? styles.active
                      : ""
                  }
                  onClick={() => setSelectMenu("postManagement_trade_admin")}
                >
                  거래
                </li>
              </NavLink>
              <NavLink to={`/member/mypage/community/${true}`}>
                <li
                  className={
                    selectMenu === "postManagement_community_admin"
                      ? styles.active
                      : ""
                  }
                  onClick={() =>
                    setSelectMenu("postManagement_community_admin")
                  }
                >
                  커뮤니티
                </li>
              </NavLink>
            </ul>
          </li>
          <li
            className={
              selectMenu === "commentManagement_admin" ||
              selectMenu === "commentManagement_trade_admin" ||
              selectMenu === "commentManagement_community_admin"
                ? styles.active
                : ""
            }
          >
            <div
              className={styles.menu_title}
              onClick={() => {
                toggleMenu("commentManagement_admin");
                setSelectMenu("commentManagement_admin");
              }}
            >
              <span
                className={`material-icons ${styles.arrow} ${
                  openMenu === "commentManagement_admin" ? styles.rotate : ""
                }`}
              >
                chevron_right
              </span>
              댓글 관리
            </div>
            <ul
              className={
                openMenu === "commentManagement_admin" ? styles.open : ""
              }
            >
              <NavLink to={`/member/mypage/marketcomment/${true}`}>
                <li
                  className={
                    selectMenu === "commentManagement_trade_admin"
                      ? styles.active
                      : ""
                  }
                  onClick={() => setSelectMenu("commentManagement_trade_admin")}
                >
                  거래
                </li>
              </NavLink>
              <NavLink to={`/member/mypage/communitycomment/${true}`}>
                <li
                  className={
                    selectMenu === "commentManagement_community_admin"
                      ? styles.active
                      : ""
                  }
                  onClick={() =>
                    setSelectMenu("commentManagement_community_admin")
                  }
                >
                  커뮤니티
                </li>
              </NavLink>
            </ul>
          </li>
          <NavLink to="/member/mypage/tradestatus">
            <li
              onClick={() => {
                toggleMenu("reportedPostManagement");
                setSelectMenu("reportedPostManagement");
              }}
              className={
                selectMenu === "reportedPostManagement" ? styles.active : ""
              }
            >
              거래 현황
            </li>
          </NavLink>
        </ul>
      )}
    </section>
  );
};
export default Mypage;
