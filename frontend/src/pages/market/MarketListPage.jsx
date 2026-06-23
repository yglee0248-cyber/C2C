import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../../components/utils/useAuthStore";
import { useEffect, useState } from "react";
import axios from "axios";
import styles from "./MarketListPage.module.css";
import Pagination from "../../components/ui/Pagination";
import Button from "../../components/ui/Button";
import ImageNotSupportedIcon from "@mui/icons-material/ImageNotSupported";
import FavoriteIcon from "@mui/icons-material/Favorite";
import BasicSelect from "../../components/ui/BasicSelect";
import Nickname from "../../components/commons/Nickname";
import PeopleIcon from "@mui/icons-material/People";
import CommentIcon from "@mui/icons-material/Comment";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { Input } from "../../components/ui/Form";
import Swal from "sweetalert2";
const MarketListPage = () => {
  const navigate = useNavigate();
  const { memberId, memberGrade } = useAuthStore();
  const [marketList, setMarketList] = useState([]);

  /* 사이즈 셋팅 */
  const [totalPage, setTotalPage] = useState(null);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);

  /* 공개상태 관리 스테이트 1 : 공개 2 : 비공개 */
  const [status, setStatus] = useState(1);

  /* 정렬관리 스테이트 */
  const [order, setOrder] = useState(0);
  /*
    0 : 최신순
    1 : 오래된순
    2 : 조회수 높은순
    3 : 좋아요 많은순
    4 : 금액 높은순
  */

  /* 화면표현용 스테이트 */
  const [keyword, setKeyword] = useState("");
  const [type, setType] = useState(1); //1:제목 2: 작성자

  /* 서버전송용 스테이트 */
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchType, setSearchType] = useState(1);
  const [location, setLocation] = useState(0);

  useEffect(() => {
    axios
      .get(
        `${import.meta.env.VITE_BACKSERVER}/markets?page=${page}&size=${size}&status=${status}&order=${order}&searchType=${searchType}&searchKeyword=${searchKeyword}&location=${location}`,
      )
      .then((res) => {
        setMarketList(res.data.items);
        setTotalPage(res.data.totalPage);
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      })
      .catch((err) => {
        console.log(err);
        Swal.fire({
          title: "오류발생,콘솔확인",
          icon: "error",
        });
      });
  }, [page, size, status, order, searchType, searchKeyword, location]);
  const list = [
    [1, "제목"],
    [2, "작성자"],
  ];
  const orderList = [
    [0, "최신순"],
    [1, "작성순"],
    [2, "조회수"],
    [3, "좋아요"],
    [4, "금액순"],
    [5, "댓글순"],
  ];
  const sizeList = [
    [10, "10개씩보기"],
    [20, "20개씩보기"],
    [50, "50개씩보기"],
  ];
  const locationList = [
    [0, "지역"],
    [1, "서울"],
    [2, "강원"],
    [3, "경기"],
    [4, "경남"],
    [5, "경북"],
    [6, "광주"],
    [7, "대구"],
    [8, "대전"],
    [9, "부산"],
    [10, "세종"],
    [11, "울산"],
    [12, "인천"],
    [13, "전남"],
    [14, "전북"],
    [15, "제주"],
    [16, "충남"],
    [17, "충북"],
  ];
  return (
    <>
      <section className={styles.market_wrap}>
        <h3
          className="page-title"
          style={{ textAlign: "center", padding: "50px 0px" }}
        >
          중고거래
        </h3>
        <div className={styles.market_searchbox}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSearchType(type);
              setSearchKeyword(keyword);
              setPage(0);
            }}
          >
            <BasicSelect
              state={location}
              setState={setLocation}
              list={locationList}
            />
            <BasicSelect state={type} setState={setType} list={list} />

            <div>
              <Input
                type="text"
                value={keyword}
                onChange={(e) => {
                  setKeyword(e.target.value);
                }}
              ></Input>
            </div>

            <Button className="btn primary" type="submit">
              검색
            </Button>
            <BasicSelect
              state={order}
              setState={(value) => {
                setOrder(value);
                setPage(0);
              }}
              list={orderList}
            ></BasicSelect>

            <BasicSelect
              state={size}
              setState={(value) => {
                setSize(value);
                setPage(0);
              }}
              list={sizeList}
            />
            <Button
              className="btn primary danger"
              onClick={() => {
                setPage(0);
                setOrder(0);
                setLocation(0);
                setType(1);
                setKeyword("");
                setSize(10);
                setSearchType(1);
                setSearchKeyword("");
                setLocation(0);
              }}
            >
              초기화
            </Button>
          </form>
        </div>
        <div className={styles.market_writebox}>
          {memberId && (
            <Link to="/market/writeFrm">
              <Button className="btn primary">글작성</Button>
            </Link>
          )}
        </div>

        <div className={styles.market_list_wrap}>
          {marketList.length === 0 ? (
            <div className={styles.no_result}>조회된 게시물이 없습니다.</div>
          ) : (
            <MarketList marketList={marketList} />
          )}
        </div>

        {marketList.length !== 0 && (
          <div className={styles.market_pagination}>
            <Pagination
              page={page}
              totalPage={totalPage}
              naviSize={5}
              setPage={setPage}
            ></Pagination>
          </div>
        )}
      </section>
    </>
  );
};
export default MarketListPage;

const MarketList = ({ marketList }) => {
  return (
    <ul>
      {marketList.map((market) => {
        return (
          <MarketItem
            key={`market-list-${market.marketNo}`}
            market={market}
            marketList={marketList}
          />
        );
      })}
    </ul>
  );
};

const MarketItem = ({ market, marketList }) => {
  const navigate = useNavigate();
  /* 이미지 매핑 */
  const timeAgo = (dateString) => {
    if (!dateString) {
      return "";
    }

    const postDate = new Date(dateString); // postDate : 게시글 올린 date(날짜, 시간등)
    const now = new Date(); // now : 지금(현재 날짜, 시간등)

    const diffInSeconds = Math.floor((now - postDate) / 1000); // 현재 시간과 게시글 시간의 차이를 초 단위로 계산

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

  const formatPrice = (price) => {
    if (price === 0) {
      return "무료나눔";
    }
    return price.toLocaleString() + "원"; // toLocaleString하면 현재 본인의 국가에 해당하는 숫자 표기법을 적용 (예 : 1000000 -> 1,000,000)
  };

  return (
    <li
      onClick={() => {
        navigate(`/market/view/${market.marketNo}`);
      }}
    >
      <div className={styles.market_info_wrap}>
        {market.marketThumb ? (
          <img
            src={`${import.meta.env.VITE_IMAGE_SERVER}/${market.marketThumb}`}
            alt={market.marketTitle}
          />
        ) : (
          <ImageNotSupportedIcon
            className={styles.ImageNotSupportedIcon}
            style={{ height: "200px", width: "200px", fill: "var(--primary)" }}
          />
        )}
        <div className={styles.info}>
          <div className={styles.member_wrap}>
            <div className={styles.member_wrap2}>
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
              <p className={styles.info_writer}>
                <Nickname member={market} />
              </p>
            </div>
            <div className={styles.info_viewCount_wrap}>
              <VisibilityIcon className={styles.icon} />
              <p className={styles.info_viewCount}>{market.viewCount}</p>
            </div>
          </div>

          <div>
            <h3 className={styles.info_title}>{market.marketTitle}</h3>
          </div>

          <div>
            <p
              className={
                market.sellPrice === 0
                  ? styles.info_price_free
                  : styles.info_price
              }
            >
              {formatPrice(market.sellPrice)}
            </p>
          </div>

          <p className={styles.info_sellAddr}>{market.sellAddr}</p>

          <div className={styles.info_icon_wrap1}>
            <div className={styles.info_icon_wrap2}>
              <div className={styles.info_likeCount_wrap}>
                <FavoriteIcon
                  className={market.isLike === 1 ? styles.icon2 : styles.icon}
                />
                <p className={styles.info_likeCount}>{market.likeCount}</p>
              </div>

              <div className={styles.info_commentCount_wrap}>
                <CommentIcon className={styles.icon} />
                <p className={styles.info_commentCount}>
                  {market.commentCount}
                </p>
              </div>
            </div>
            <div className={styles.info_date_wrap}>
              <CalendarTodayIcon className={styles.icon} />
              <p className={styles.info_date}>{timeAgo(market.marketDate)}</p>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
};
