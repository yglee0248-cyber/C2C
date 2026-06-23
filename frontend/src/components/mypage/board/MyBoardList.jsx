import MyBoardItem from "./MyBoardItem";
import styles from "./MyMarketList.module.css";

const MyBoardList = ({ boardList, setBoardList, status, isAdminMode }) => {
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
    <div className={isAdminMode === "true" ? styles.left : ""}>
      {boardList.map((board, index) => (
        <MyBoardItem
          key={board.boardNo}
          board={board}
          index={index}
          boardList={boardList}
          setBoardList={setBoardList}
          status={status} // 숨김 여부
          isAdminMode={isAdminMode} // 관리자 모드
          timeAgo={timeAgo}
        />
      ))}
    </div>
  );
};

export default MyBoardList;
