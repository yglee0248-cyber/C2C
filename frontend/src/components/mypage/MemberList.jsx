import { NavLink, useNavigate } from "react-router-dom";
import styles from "./MemberList.module.css";

const MemberList = ({ memberList }) => {
  return (
    <>
      <ul className={styles.member_item_title}>
        <li className={styles.member_id}>아이디</li>
        <li className={styles.member_name}>이름</li>
        <li className={styles.member_email}>이메일</li>
        <li className={styles.member_grade}>등급</li>
      </ul>
      <ul className={styles.member_list_wrap}>
        {memberList.map((member) => {
          return (
            <MemberItem
              key={`member-list-${member.memberId}`}
              member={member}
            />
          );
        })}
      </ul>
    </>
  );
};

const MemberItem = ({ member }) => {
  return (
    <NavLink to={`/member/mypage/member-management/${member.memberId}`}>
      <ul className={styles.member_item}>
        <li className={styles.member_id}>{member.memberId}</li>
        <li className={styles.member_name}>{member.memberName}</li>
        <li className={styles.member_email}>{member.memberEmail}</li>
        <li className={styles.member_grade}>
          {member.memberGrade === 1
            ? "슈퍼 유저"
            : member.memberGrade === 2
              ? "관리자"
              : "일반회원"}
        </li>
      </ul>
    </NavLink>
  );
};

export default MemberList;
