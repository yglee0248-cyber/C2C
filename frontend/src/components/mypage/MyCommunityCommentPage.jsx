import { useEffect, useState } from "react";
import BasicSelect from "../ui/BasicSelect";
import styles from "./MyCommentPage.module.css";
import Pagination from "../ui/Pagination";
import { Input } from "../ui/Form";
import SearchIcon from "@mui/icons-material/Search";
import MyCommentItem from "./comment/MyCommentItem";
import useAuthStore from "../utils/useAuthStore";
import axios from "axios";
import { useParams } from "react-router-dom";

const MyCommunityCommentPage = () => {
  const { isAdminMode } = useParams();

  const memberId = useAuthStore((state) => state.memberId);
  const memberGrade = useAuthStore((state) => state.memberGrade);

  const [commentList, setCommentList] = useState([]);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPage, setTotalPage] = useState(null);
  const [order, setOrder] = useState(0); // 0: 최신순 / 1: 작성순 / 2: 싫어요
  const [keyword, setKeyword] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");

  useEffect(() => {
    // 커뮤 댓글 get
    axios
      .get(
        `${import.meta.env.VITE_BACKSERVER}/mypages/comment/community?isAdminMode=${isAdminMode}&page=${page}&size=${size}&order=${order}&searchKeyword=${searchKeyword}&memberId=${memberId}&memberGrade=${memberGrade}`,
      )
      .then((res) => {
        setCommentList(res.data.list);
        setTotalPage(res.data.totalPage);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [page, order, searchKeyword]);

  useEffect(() => {
    setPage(0);
  }, [order, searchKeyword]);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [page]);

  const timeAgo = (dateString) => {
    // 받은 시간값이 없으면 return
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

  return (
    <div className={styles.mycomment_wrap}>
      <h3 className="page-title">커뮤니티 게시글 댓글 관리</h3>
      <div className={styles.filter_section}>
        {isAdminMode === "false" ? (
          ""
        ) : (
          <div className={styles.filter_input}>
            <Input
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value);
              }}
              placeholder="회원명 검색"
            />
            <SearchIcon
              className={styles.search_icon}
              onClick={() => {
                setSearchKeyword(keyword);
              }}
            />
          </div>
        )}
        <div className={styles.filter_select}>
          <BasicSelect
            state={order}
            setState={setOrder}
            list={[
              [0, "최신순"],
              [1, "작성순"],
              [2, "신고순"],
              [3, "좋아요"],
              [4, "싫어요"],
            ]}
          />
        </div>
      </div>
      <div className={styles.mycomment_list_content}>
        <div className={styles.mycomment_list_wrap}>
          {commentList.map((comment, index) => (
            <MyCommentItem
              key={comment.commentNo}
              comment={comment}
              index={index}
              commentList={commentList}
              setCommentList={setCommentList}
              type="community"
              isAdminMode={isAdminMode} // 관리자 모드
              tblName="communityComment"
              timeAgo={timeAgo}
            />
          ))}
        </div>
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

export default MyCommunityCommentPage;
