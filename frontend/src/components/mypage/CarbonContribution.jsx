import { useEffect, useState } from "react";
import styles from "./CarbonContribution.module.css";
import axios from "axios";
import useAuthStore from "../utils/useAuthStore";
import Pagination from "../ui/Pagination";
import BasicSelect from "../ui/BasicSelect";
import { useNavigate } from "react-router-dom";

const CarbonContribution = () => {
  const { memberId } = useAuthStore();
  const [memberScore, setMemberScore] = useState(0);

  const [carbonContributionList, setCarbonContributionList] = useState([]);

  const [page, setPage] = useState(0); // 시작 숫자
  const [size, setSize] = useState(10); // 페이징 개수
  const [totalPage, setTotalPage] = useState(null);
  const [order, setOrder] = useState(1); // 정렬 조건
  const [view, setView] = useState(0); //출력 조건

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BACKSERVER}/members/${memberId}`)
      .then((res) => {
        setMemberScore(res.data.memberScore);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  useEffect(() => {
    axios
      .get(
        `${import.meta.env.VITE_BACKSERVER}/markets/carbon-contribution/${memberId}?page=${page}&size=${size}&order=${order}&view=${view}`,
      )
      .then((res) => {
        setCarbonContributionList(res.data.items);
        setTotalPage(res.data.totalPage);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [page, order, view]);

  return (
    <section className={styles.carbon_contribution_wrap}>
      <h3 className="page-title">나의 탄소 기여도</h3>
      <div className={styles.carbon_contribution}>
        <p>{memberScore}P</p>
      </div>

      {carbonContributionList.length === 0 ? (
        <div className={styles.carbon_contribution_none}>
          <h2>기여도 적립 내역이 없습니다.</h2>
        </div>
      ) : (
        <div className={styles.carbon_contribution_list_wrap}>
          <div className={styles.carbon_contribution_order_wrap}>
            <BasicSelect
              state={view}
              setState={setView}
              onChange={(e) => {
                setPage(0);
              }}
              list={[
                [0, "전체"],
                [1, "적립"],
                [2, "소모"],
              ]}
            />
            <BasicSelect
              state={order}
              setState={setOrder}
              onChange={(e) => {
                setPage(0);
              }}
              list={[
                [1, "최신순"],
                [2, "과거순"],
              ]}
            />
          </div>
          <CarbonContributionList
            carbonContributionList={carbonContributionList}
          />
          <div className={styles.carbon_contribution_list_pagination}>
            <Pagination
              page={page}
              setPage={setPage}
              totalPage={totalPage}
              naviSize={5}
            />
          </div>
        </div>
      )}
    </section>
  );
};

const CarbonContributionList = ({ carbonContributionList }) => {
  return (
    <>
      <ul className={styles.carbon_contribution_list_title}>
        <li className={styles.carbon_contribution_status}>상태</li>
        <li className={styles.carbon_contribution_market_title_none}>거래명</li>
        <li className={styles.carbon_contribution_changed_score}>
          기여도 획득량
        </li>
        <li className={styles.carbon_contribution_score_date}>거래일</li>
      </ul>
      <ul className={styles.carbon_contribution_list_wrap}>
        {carbonContributionList.map((carbonContribution) => {
          return (
            <CarbonContributionItem
              key={`carbonContribution-list-${carbonContribution.scoreNo}`}
              carbonContribution={carbonContribution}
            />
          );
        })}
      </ul>
    </>
  );
};

const CarbonContributionItem = ({ carbonContribution }) => {
  const navigate = useNavigate();

  return (
    <ul className={styles.carbon_contribution_list}>
      {carbonContribution.historyStatus === 1 ? (
        <li className={`${styles.carbon_contribution_status} ${styles.green}`}>
          적립
        </li>
      ) : (
        <li className={`${styles.carbon_contribution_status} ${styles.red}`}>
          소모
        </li>
      )}
      {carbonContribution.marketNo === null ? (
        <li className={styles.carbon_contribution_market_title_none}>
          {carbonContribution.marketTitle}
        </li>
      ) : (
        <li
          className={styles.carbon_contribution_market_title}
          onClick={() => {
            navigate(`/market/view/${carbonContribution.marketNo}`);
          }}
        >
          {carbonContribution.marketTitle}
        </li>
      )}

      {carbonContribution.historyStatus === 1 ? (
        <li
          className={`${styles.carbon_contribution_changed_score} ${styles.green}`}
        >
          + {carbonContribution.changedScore}P
        </li>
      ) : (
        <li
          className={`${styles.carbon_contribution_changed_score} ${styles.red}`}
        >
          - {carbonContribution.changedScore}P
        </li>
      )}

      <li className={styles.carbon_contribution_score_date}>
        {carbonContribution.scoreDate}
      </li>
    </ul>
  );
};

export default CarbonContribution;
