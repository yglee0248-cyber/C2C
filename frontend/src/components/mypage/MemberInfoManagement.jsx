import styles from "./MemberInfo.module.css";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../utils/useAuthStore";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Input } from "../ui/Form";
import Button from "../ui/Button";
import Swal from "sweetalert2";
import { useParams } from "react-router-dom";

const MemberInfoManagement = () => {
  const { memberGrade } = useAuthStore();
  const { memberId } = useParams();

  const navigate = useNavigate();
  const inputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const [member, setMember] = useState({ memberThumb: null });

  useEffect(() => {
    if (!memberId) return;
    axios
      .get(`${import.meta.env.VITE_BACKSERVER}/members/${memberId}`)
      .then((res) => {
        setMember(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  // 프로필 미리보기 설정
  const previewChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);

    const previewUrl = URL.createObjectURL(selectedFile);
    setPreview(previewUrl);
  };

  // 프로필 이미지 등록/수정
  const changeThumb = (e) => {
    // 새로 선택된 이미지 있을 때
    if (!file) {
      return;
    }
    if (file) {
      const file = inputRef.current.files && inputRef.current.files[0];

      const form = new FormData();
      form.append("file", file);
      axios //여기 확인
        .patch(
          `${import.meta.env.VITE_BACKSERVER}/members/${memberId}/thumbnail/update`,
          form,
          { headers: { "content-Type": "multipart/form-data" } },
        )
        .then((res) => {})
        .catch((err) => {
          console.log(err);
        });
    }
  };

  // 프로필 이미지 삭제
  const deleteThumb = (e) => {
    setFile(null);
    setPreview(null);
    setMember((prev) => ({ ...prev, memberThumb: null }));
  };

  // 회원 삭제
  const memberDelete = () => {
    Swal.fire({
      title: "정말 삭제하시겠습니까?",
      text: "삭제 이후에는 계정의 정보를 복구할 수 없습니다.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "var(--primary)",
      cancelButtonColor: "var(--danger)",
      confirmButtonText: "예",
      cancelButtonText: "아니오",
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .delete(`${import.meta.env.VITE_BACKSERVER}/members/${memberId}`)
          .then((res) => {
            if (res.data === 1) {
              Swal.fire({
                title: "삭제가 완료되었습니다.",
                icon: "success",
              });
              navigate("/member/mypage/member-management");
            }
          })
          .catch((err) => {
            console.log(err);
          });
      }
    });
  };

  // 회원 정보 수정
  const memberUpdate = () => {
    axios
      .patch(`${import.meta.env.VITE_BACKSERVER}/members/${memberId}`, member)
      .then((res) => {
        Swal.fire({ title: "수정완료", icon: "success" });
        navigate("/member/mypage/member-management");
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <section className={styles.member_info_wrap}>
      <h3 className="page-title">회원 정보</h3>
      <div className={styles.profile_info_update}>
        <form
          onSubmit={(e) => {
            e.preventDefault();

            changeThumb();
            memberUpdate();
          }}
          autoComplete="off"
        >
          <div className={styles.member_thumb_wrap}>
            <label htmlFor="memberThumb">프로필 이미지</label>
            <div className={styles.member_thumb_img_wrap}>
              <div
                className={
                  member.memberThumb || preview
                    ? styles.member_thumb_exists
                    : styles.member_thumb
                }
              >
                {preview ? (
                  <img src={preview} alt="preview" />
                ) : member.memberThumb ? (
                  <img
                    src={`${import.meta.env.VITE_BACKSERVER}/semi/${member.memberThumb}`}
                    alt="member"
                  />
                ) : (
                  <span className="material-icons">account_circle</span>
                )}
              </div>
            </div>
          </div>
          <div className={styles.thumb_button_wrap}>
            <Button
              type="button"
              className="btn primary"
              onClick={() => inputRef.current.click()}
            >
              이미지 변경
            </Button>
            <input
              type="file"
              accept="image/*"
              ref={inputRef}
              style={{ display: "none" }}
              onChange={previewChange}
            ></input>
            <Button type="button" className="btn primary" onClick={deleteThumb}>
              이미지 제거
            </Button>
          </div>
          <ul className={`${styles.info_input_wrap} ${styles.member_name}`}>
            <li>
              <label htmlFor="memberName">이름</label>
            </li>
            <li>
              <Input
                type="text"
                name="memberName"
                id="memberName"
                value={member.memberName}
                onChange={(e) => {
                  setMember({ ...member, memberName: e.target.value });
                }}
              ></Input>
            </li>
          </ul>
          <ul className={`${styles.info_input_wrap} ${styles.member_id}`}>
            <li>
              <label htmlFor="memberId">아이디</label>
            </li>
            <li>
              <Input
                type="text"
                name="memberId"
                id="memberId"
                value={memberId}
                readOnly={true}
              ></Input>
            </li>
          </ul>
          <ul className={`${styles.info_input_wrap} ${styles.member_email}`}>
            <li>
              <label htmlFor="memberEmail">이메일</label>
            </li>
            <li>
              <Input
                type="email"
                name="memberEmail"
                id="memberEmail"
                value={member.memberEmail}
                readOnly={true}
              ></Input>
            </li>
          </ul>

          <ul className={`${styles.info_input_wrap} ${styles.member_postcode}`}>
            <li>
              <label htmlFor="memberPostcode">우편번호</label>
            </li>
            <li>
              <Input
                type="text"
                name="memberPostcode"
                id="memberPostcode"
                value={member.memberPostcode}
                readOnly={true}
              ></Input>
            </li>
          </ul>
          <ul className={`${styles.info_input_wrap} ${styles.member_addr}`}>
            <li>
              <label htmlFor="memberAddr">도로명주소</label>
            </li>
            <li>
              <Input
                type="text"
                name="memberAddr"
                id="memberAddr"
                value={member.memberAddr}
                readOnly={true}
              ></Input>
            </li>
          </ul>
          <ul
            className={`${styles.info_input_wrap} ${styles.member_detail_addr}`}
          >
            <li>
              <label htmlFor="memberDetailAddr">상세주소</label>
            </li>
            <li>
              <Input
                type="text"
                name="memberDetailAddr"
                id="memberDetailAddr"
                value={member.memberDetailAddr}
                readOnly={true}
              ></Input>
            </li>
          </ul>
          <ul className={`${styles.info_input_wrap} ${styles.member_grade}`}>
            <li>등급</li>
            <li>
              <label>
                <input
                  type="radio"
                  value={member.memberGrade}
                  checked={member.memberGrade === 3}
                  disabled={memberGrade === 2 ? true : false}
                  onChange={() => {
                    setMember((prev) => ({ ...prev, memberGrade: 3 }));
                  }}
                />
                일반회원
              </label>
            </li>
            <li>
              <label>
                <input
                  type="radio"
                  value={member.memberGrade}
                  checked={member.memberGrade === 2}
                  disabled={
                    member.memberGrade === 1 && memberGrade !== 1 ? true : false
                  }
                  onChange={() => {
                    setMember((prev) => ({ ...prev, memberGrade: 2 }));
                  }}
                />
                관리자
              </label>
            </li>
          </ul>
          <div className={styles.member_delete_button_wrap}>
            <Button
              type="button"
              className="btn primary outline"
              onClick={memberDelete}
            >
              회원삭제
            </Button>
          </div>
          <Button type="submit" className="btn primary lg">
            회원 정보 수정
          </Button>
        </form>
      </div>
    </section>
  );
};

export default MemberInfoManagement;
