import { useEffect, useState } from "react";
import Pagination from "../ui/Pagination";
import styles from "./MyBoardPage.module.css";
import BasicSelect from "../ui/BasicSelect";
import useAuthStore from "../utils/useAuthStore";
import axios from "axios";
import LikeDislikeList from "./board/LikeDislikeList";
import { useParams } from "react-router-dom";

const LikeDislike = () => {
  const memberId = useAuthStore((state) => state.memberId);
  const { type } = useParams(); // 1: 좋아요 / 2: 싫어요 / 3: 신고
  const [boardList, setBoardList] = useState([]);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPage, setTotalPage] = useState(null);
  const [order, setOrder] = useState(0); // 0: 최신순 / 1: 작성순 / 2: 조회수 / 3: 좋아요 / 4: 싫어요 / 5: 신고수

  useEffect(() => {
    // 좋아요/싫어요/신고 누른 거래, 커뮤 게시글 가지고오기
    axios
      .get(
        `${import.meta.env.VITE_BACKSERVER}/mypages/board/likedislike?page=${page}&size=${size}&order=${order}&status=${type}&memberId=${memberId}`,
      )
      .then((res) => {
        setBoardList(res.data.list);
        setTotalPage(res.data.totalPage);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [page, order, type]);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [page]);

  return (
    <div className={styles.myboard_wrap}>
      <h3 className="page-title">
        {type === "1"
          ? "좋아요 게시글"
          : type === "2"
            ? "싫어요 게시글"
            : "신고 게시글"}
      </h3>
      <div className={styles.filter_section}>
        <div className={styles.filter_select}>
          <BasicSelect
            state={order}
            setState={setOrder}
            list={[
              [0, "최신순"],
              [1, "작성순"],
              [2, "조회수순"],
              [3, "좋아요순"],
              [4, "싫어요순"],
              [5, "신고수순"],
            ]}
          />
        </div>
      </div>
      <div className={styles.myboard_list_content}>
        {/* axios.get으로 가지고온 좋아요/싫어요/신고 (거래, 커뮤) 게시글 리스트 넘기기 */}
        <LikeDislikeList boardList={boardList} type={type} />
      </div>
      <div className={styles.pagination_section}>
        <Pagination
          totalPage={totalPage}
          page={page}
          setPage={setPage}
          naviSize={5}
        />
      </div>
    </div>
  );
};

export default LikeDislike;
