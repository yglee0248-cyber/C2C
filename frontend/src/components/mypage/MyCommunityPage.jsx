import { useEffect, useState } from "react";
import Pagination from "../ui/Pagination";
import MyBoardList from "./board/MyBoardList";
import styles from "./MyBoardPage.module.css";
import BasicSelect from "../ui/BasicSelect";
import useAuthStore from "../utils/useAuthStore";
import axios from "axios";
import SearchIcon from "@mui/icons-material/Search";
import { Input } from "../ui/Form";
import { useParams } from "react-router-dom";

const MyCommunityPage = () => {
  const { isAdminMode } = useParams();

  const memberId = useAuthStore((state) => state.memberId);
  const memberGrade = useAuthStore((state) => state.memberGrade);

  const [boardList, setBoardList] = useState([]);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPage, setTotalPage] = useState(null);
  const [order, setOrder] = useState(0); // 0: 최신순 / 1: 작성순 / 2: 조회수 / 3: 좋아요 / 4: 싫어요 / 5: 신고수
  const [status, setStatus] = useState(0); // 0: 전체 / 1: 공개 / 2: 비공개
  const [keyword, setKeyword] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [notice, setNotice] = useState(0); // 0: 전체 / 1: 공지

  useEffect(() => {
    // 커뮤 게시글 get
    axios
      .get(
        `${import.meta.env.VITE_BACKSERVER}/mypages/board/community?isAdminMode=${isAdminMode}&page=${page}&size=${size}&order=${order}&status=${status}&searchKeyword=${searchKeyword}&memberId=${memberId}&memberGrade=${memberGrade}&notice=${notice}`,
      )
      .then((res) => {
        setBoardList(res.data.list);
        setTotalPage(res.data.totalPage);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [page, order, notice, status, searchKeyword]);

  useEffect(() => {
    setPage(0);
  }, [order, status, notice, searchKeyword]);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [page]);

  return (
    <div className={styles.myboard_wrap}>
      <h3 className="page-title">커뮤니티 게시글 관리</h3>
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
              placeholder="제목 검색"
            />
            <SearchIcon
              onClick={() => {
                setSearchKeyword(keyword);
              }}
            />
          </div>
        )}

        <div className={styles.filter_select}>
          {isAdminMode === "true" ? (
            <BasicSelect
              state={notice}
              setState={setNotice}
              list={[
                [0, "전체"],
                [1, "공지"],
              ]}
            />
          ) : (
            ""
          )}

          <BasicSelect
            state={status}
            setState={setStatus}
            list={[
              [0, "전체"],
              [1, "공개"],
              [2, "비공개"],
            ]}
          />

          <BasicSelect
            state={order}
            setState={setOrder}
            list={[
              [0, "최신순"],
              [1, "작성순"],
              [2, "조회수"],
              [3, "좋아요"],
              [4, "싫어요"],
              [5, "신고수"],
            ]}
          />
        </div>
      </div>
      <div className={styles.myboard_list_content}>
        <MyBoardList
          boardList={boardList}
          setBoardList={setBoardList}
          status={status}
          isAdminMode={isAdminMode}
        />
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

export default MyCommunityPage;
