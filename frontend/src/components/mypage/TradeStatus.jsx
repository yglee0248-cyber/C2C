import { useEffect, useState } from "react";
import styles from "./TradeStatus.module.css";
import DateRangePicker from "../ui/DateRangePicker";
import dayjs from "dayjs";
import axios from "axios";
import BasicSelect from "../ui/BasicSelect";
import Pagination from "../ui/Pagination";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const TradeStatus = () => {
  const [chart, setChart] = useState([]);
  const [list, setList] = useState([]);
  const [complete, setComplete] = useState(2); // 2: 전체 / 1: 완료 / 0: 미완료
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPage, setTotalPage] = useState(null);

  const [start, setStart] = useState(dayjs().subtract(30, "day")); // 처음 시작은 오늘부터 30일 전까지
  const [end, setEnd] = useState(dayjs()); // 처음 시작은 오늘부터 30일 전까지
  const [formStart, setFormStart] = useState(null);
  const [formEnd, setFormEnd] = useState(null);

  useEffect(() => {
    if (start && end && start.isAfter(end)) {
      setEnd(null);
    }
  }, [start]);

  useEffect(() => {
    if (start && end && end.isBefore(start)) {
      setStart(null);
    }
  }, [end]);

  // "yyyy-mm-dd" 형식으로 만들기
  useEffect(() => {
    setFormStart(start ? dayjs(start).format("YYYY-MM-DD") : null);
    setFormEnd(end ? dayjs(end).format("YYYY-MM-DD") : null);
  }, [start, end]);

  useEffect(() => {
    if (!formStart || !formEnd) return;

    // 차트용 데이터 (전체, 완료, 미완료 count) => offset없이 전부 가지고 오기
    axios
      .get(`${import.meta.env.VITE_BACKSERVER}/mypages/tradestatus/chart`, {
        params: {
          start: formStart, // 시작일
          end: formEnd, // 종료일
          complete: complete, // 완료 여부
        },
      })
      .then((res) => {
        setChart(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [complete, formStart, formEnd]);

  useEffect(() => {
    if (!formStart || !formEnd) return;

    // 페이지네이션으로 구현하기 위해 offset으로 가지고오기
    axios
      .get(`${import.meta.env.VITE_BACKSERVER}/mypages/tradestatus/list`, {
        params: {
          start: formStart,
          end: formEnd,
          complete: complete,
          page: page,
          size: size,
        },
      })
      .then((res) => {
        setList(res.data.list);
        setTotalPage(res.data.totalPage);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [complete, formStart, formEnd, page]);

  return (
    <div className={styles.trade_status_wrap}>
      <h3 className="page-title">거래 현황</h3>
      <section className={styles.chart_filter_section}>
        <div>
          <DateRangePicker
            startDate={start}
            setStartDate={setStart}
            endDate={end}
            setEndDate={setEnd}
          />
        </div>
        <div>
          <BasicSelect
            state={complete}
            setState={setComplete}
            list={[
              [2, "전체"],
              [1, "완료"],
              [0, "미완료"],
            ]}
          />
        </div>
      </section>
      <section className={styles.chart_section}>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chart}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="marketDate" />
            <YAxis />
            <Tooltip />
            <Legend />

            {/* 전체 거래 */}
            {complete === 2 ? (
              <Line
                dataKey="totalCount"
                stroke="gray"
                name="전체 거래"
                dot={false}
              />
            ) : (
              ""
            )}

            {/* 완료 거래 */}
            {complete === 2 || complete === 1 ? (
              <Line
                dataKey="completedCount"
                stroke="rgb(37, 136, 37)"
                name="완료된 거래"
                dot={false}
              />
            ) : (
              ""
            )}

            {/* 미완료 거래 */}
            {complete === 2 || complete === 0 ? (
              <Line
                dataKey="incompletedCount"
                stroke="rgb(211, 81, 81)"
                name="미완료 거래"
                dot={false}
              />
            ) : (
              ""
            )}
          </LineChart>
        </ResponsiveContainer>
      </section>
      <section className={styles.list_filter_section}></section>
      <section className={styles.list_section}>
        <ul className={`${styles.trade_item} ${styles.title_ul}`}>
          <li className={styles.trade_no}>거래 번호</li>
          <li className={styles.trade_title}>거래 제목</li>
          <li className={styles.trade_addr}>거래 장소</li>
          <li className={styles.trade_price}>거래 금액</li>
          <li className={styles.trade_completed}>완료 여부</li>
          <li className={styles.trade_completed_date}>완료된 날짜</li>
        </ul>
        {list.map((item) => (
          <ul className={styles.trade_item} key={item.marketNo}>
            <li className={styles.trade_no}>{item.marketNo}</li>
            <li className={styles.trade_title}>{item.marketTitle}</li>
            <li className={styles.trade_addr}>{item.sellAddr}</li>
            <li className={styles.trade_price}>{item.sellPrice}</li>
            <li className={styles.trade_completed}>
              {item.completed === 0 ? "미완료" : "완료"}
            </li>
            <li className={styles.trade_completed_date}>
              {item.completedDate || "-"}
            </li>
          </ul>
        ))}
        <div className={styles.pagination}>
          {!formStart || !formEnd || (
            <Pagination
              totalPage={totalPage}
              page={page}
              setPage={setPage}
              naviSize={5}
            />
          )}
        </div>
      </section>
    </div>
  );
};

export default TradeStatus;
