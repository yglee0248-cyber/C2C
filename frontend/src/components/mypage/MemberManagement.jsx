import { useEffect, useState } from "react";
import styles from "./MemberManagement.module.css";
import { Input } from "../ui/Form";
import Button from "../ui/Button";
import Pagination from "../ui/Pagination";
import MemberList from "./MemberList";
import axios from "axios";
import BasicSelect from "../ui/BasicSelect";

const MemberManagement = () => {
  const [type, setType] = useState(1);
  const [keyword, setKeyword] = useState(""); // 검색어
  const [order, setOrder] = useState(1); // 정렬 조건
  const [selectedGrade, setSelectedGrade] = useState(0); // 출력 조건

  const [searchType, setSearchType] = useState(0); // 제출할 검색 조건
  const [searchKeyword, setSearchKeyword] = useState("");

  const [memberList, setMemberList] = useState([]);
  const [page, setPage] = useState(0); // 시작 숫자
  const [size, setSize] = useState(10); // 페이징 개수
  const [totalPage, setTotalPage] = useState(null);

  useEffect(() => {
    axios
      .get(
        `${import.meta.env.VITE_BACKSERVER}/members?page=${page}&size=${size}&order=${order}&selectedGrade=${selectedGrade}&searchType=${searchType}&searchKeyword=${searchKeyword}`,
      )
      .then((res) => {
        setMemberList(res.data.items);
        setTotalPage(res.data.totalPage);
        window.scrollTo(0, 0);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [page, order, searchType, searchKeyword, selectedGrade]);

  return (
    <section className={styles.member_management}>
      <h3 className="page-title">회원 관리</h3>
      <div className={styles.search_wrap}>
        <div className={styles.order_wrap}>
          <BasicSelect
            state={order}
            setState={setOrder}
            list={[
              [1, "아이디 오름차순"],
              [2, "아이디 내림차순"],
              [3, "이름 오름차순"],
              [4, "이름 내림차순"],
            ]}
          />
          <BasicSelect
            state={selectedGrade}
            setState={setSelectedGrade}
            list={[
              [0, "전체 등급"],
              [1, "슈퍼 유저"],
              [2, "관리자"],
              [3, "일반회원"],
            ]}
          />
        </div>
        <form
          className={styles.search}
          onSubmit={(e) => {
            e.preventDefault();
            setSearchType(type);
            setSearchKeyword(keyword);
            setPage(0);
          }}
        >
          <BasicSelect
            state={type}
            setState={setType}
            list={[
              [1, "이름"],
              [2, "아이디"],
              [3, "이메일"],
            ]}
          />
          <Input
            type="text"
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value);
            }}
          ></Input>
          <Button type="submit" className="btn primary">
            <span className="material-icons">search</span>
          </Button>
        </form>
      </div>
      <div className={styles.list_wrap}>
        <MemberList memberList={memberList} />
        <div className={styles.member_list_pagination}>
          <Pagination
            page={page}
            setPage={setPage}
            totalPage={totalPage}
            naviSize={5}
          />
        </div>
      </div>
    </section>
  );
};

export default MemberManagement;
