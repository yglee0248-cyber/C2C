import { useNavigate } from "react-router-dom";
import styles from "./CommunityList.module.css";
import axios from "axios";
import Nickname from "../commons/Nickname";

const CommunityList = ({ communityList }) => {
  return (
    <ul className={styles.community_list_wrap}>
      {communityList.map((community) => {
        return (
          <CommunityItem
            key={`community-list-${community.communityNo}`}
            community={community}
          />
        );
      })}
    </ul>
  );
};

const CommunityItem = ({ community }) => {
  const navigate = useNavigate();

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
    <li
      className={
        community.memberGrade === 3
          ? styles.community_item
          : styles.community_item_manager
      }
    >
      <div className={styles.community_writer_view_wrap}>
        <div className={styles.community_writer}>
          <div
            className={
              community.memberThumb
                ? styles.member_thumb_exists
                : styles.member_thumb
            }
          >
            {community.memberThumb ? (
              <img
                src={`${import.meta.env.VITE_BACKSERVER}/semi/${community.memberThumb}`}
              ></img>
            ) : (
              <span className="material-icons">account_circle</span>
            )}
          </div>
          <Nickname member={community} />
          <p>{community.memberGrade === 3 ? "" : " (관리자)"}</p>
        </div>
        <div className={styles.community_view_count}>
          <span className="material-icons">visibility</span>
          <p>{community.viewCount}</p>
        </div>
      </div>
      <div
        className={styles.community_content_wrap}
        onClick={async () => {
          try {
            await axios.patch(
              `${import.meta.env.VITE_BACKSERVER}/communities/view/${community.communityNo}`,
              community,
            );
          } catch (e) {
            console.error(e);
          }
          navigate(`/community/view/${community.communityNo}`);
        }}
      >
        <p className={styles.community_title}>
          {community.memberGrade === 3
            ? community.communityTitle
            : "[공지] " + community.communityTitle}
        </p>
        <ConvertContent communityContent={community.communityContent} />
      </div>
      <div className={styles.community_info_wrap}>
        <div className={styles.community_info_item_wrap}>
          {/* 🚀 1. 좋아요 (내가 눌렀으면(_on) 초록색, 아니면 회색) */}
          <div
            className={
              community.isLike === 1
                ? styles.community_info_like_wrap_on
                : styles.community_info_like_wrap
            }
          >
            <span className="material-icons">thumb_up</span>
            <p>{community.likeCount}</p>
          </div>

          {/* 🚀 2. 싫어요 (내가 눌렀으면(_on) 빨간색, 아니면 회색) */}
          <div
            className={
              community.isDislike === 1
                ? styles.community_info_dislike_wrap_on
                : styles.community_info_dislike_wrap
            }
          >
            <span className="material-icons">thumb_down</span>
            <p>{community.dislikeCount}</p>
          </div>

          {/* 댓글 수 */}
          <div
            className={
              community.commentCount === 0
                ? styles.community_info_comment_count_wrap
                : styles.community_info_comment_count_wrap_on
            }
          >
            <span className="material-icons">comment</span>
            <p>{community.commentCount}</p>
          </div>
        </div>
        
        <div className={styles.community_date_wrap}>
          <p>{timeAgo(community.communityDate)}</p>
        </div>
      </div>
    </li>
  );
};

const ConvertContent = ({ communityContent }) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(communityContent, "text/html");
  const text = doc.body.textContent || "";
  return <div className={styles.community_content}>{text}</div>;
};

export default CommunityList;
