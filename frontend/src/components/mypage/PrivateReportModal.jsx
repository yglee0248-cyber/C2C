import styles from "./PrivateReportModal.module.css";
import axios from "axios";
import { useEffect, useState } from "react";
import useAuthStore from "../utils/useAuthStore";

const PrivateReportModal = ({ board, tblName }) => {
  const memberId = useAuthStore((state) => state.memberId);

  // tblName: market / community / marketComment / communityComment
  const obj = {
    boardNo:
      tblName === "market" || tblName === "community"
        ? board.boardNo
        : board.commentNo,

    tblName: tblName,
    memberId: memberId,
  };

  const [report, setReport] = useState([]);

  useEffect(() => {
    axios
      .get(
        `${import.meta.env.VITE_BACKSERVER}/mypages/report/private/${board.boardNo}`,
        { params: obj },
      )
      .then((res) => {
        setReport(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  return (
    <div className={styles.report_wrap}>
      <div className={styles.report_title}>내가 작성한 신고</div>
      <div className={styles.report_reason}>{report.reason}</div>
    </div>
  );
};

export default PrivateReportModal;
