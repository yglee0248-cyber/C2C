import styles from "./MemberInfo.module.css";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../utils/useAuthStore";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Input } from "../ui/Form";
import Button from "../ui/Button";
import Swal from "sweetalert2";
import { useKakaoPostcode } from "@clroot/react-kakao-postcode";

const MemberInfo = () => {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const detailRef = useRef(null);

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const { memberId } = useAuthStore();
  const [member, setMember] = useState({ memberThumb: null });
  const [memberAuth, setMemberAuth] = useState({
    memberId: "",
    memberPw: "",
  });
  const [memberAuthSuccess, setMemberAuthSuccess] = useState(false);
  const [newEmail, setNewEmail] = useState(null);

  const inputMember = (e) => {
    setMemberAuth({ ...memberAuth, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    if (!memberId) return;

    axios
      .get(`${import.meta.env.VITE_BACKSERVER}/members/${memberId}`)
      .then((res) => {
        setMember(res.data);
        setMemberAuth((prev) => ({ ...prev, memberId: res.data.memberId }));
        setNewEmail(res.data.memberEmail);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  // 비밀번호 인증
  const auth = () => {
    if (memberAuth.memberPw === "") {
      alert("비밀번호를 입력해주세요.");
      return;
    }

    axios
      .post(`${import.meta.env.VITE_BACKSERVER}/members/pw-auth`, memberAuth)
      .then((res) => {
        setMemberAuthSuccess(true);
      })
      .catch((err) => {
        console.log(err);
        Swal.fire({
          icon: "error",
          title: "인증 실패",
          text: "비밀번호를 확인하세요.",
        });
      });
  };

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
      axios
        .patch(
          `${import.meta.env.VITE_BACKSERVER}/members/${memberId}/thumbnail/update`,
          form,
          { headers: { "content-Type": "multipart/form-data" } },
        )
        .then((res) => {
          useAuthStore.getState().setThumb(res.data);
        })
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

  // 인증 메일 전송
  const [mailAuth, setMailAuth] = useState(0);
  const [mailAuthCode, setMailAuthCode] = useState(null);
  const [mailAuthInput, setMailAuthInput] = useState("");

  const [time, setTime] = useState(300);
  const timerRef = useRef(null);

  const sendMail = () => {
    setTime(300);
    setMailAuthCode(null);
    if (timerRef.current) window.clearInterval(timerRef.current);

    setMailAuth(1);

    Swal.fire({ title: "메일 발송 중...", didOpen: () => Swal.showLoading() });

    axios
      .post(`${import.meta.env.VITE_BACKSERVER}/members/email-verification`, {
        memberEmail: newEmail,
      })
      .then((res) => {
        Swal.fire({
          icon: "success",
          title: "발송 완료",
          text: "이메일로 인증번호가 발송되었습니다.",
        });
        setMailAuthCode(res.data);
        setMailAuth(2);

        // 인증코드 인증시간이 넘었을때를 위해
        timerRef.current = window.setInterval(() => {
          setTime((prev) => {
            if (prev <= 1) {
              window.clearInterval(timerRef.current);
              Swal.fire({
                icon: "warning",
                title: "시간 초과",
                text: "인증 시간이 만료되었습니다. 다시 시도해주세요.",
              });
              setMailAuthCode(null);
              setMailAuth(0);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      })
      .catch((err) => {
        console.log(err);
        Swal.fire({
          icon: "error",
          title: "발송 실패",
          text: "이메일 발송에 실패했습니다. 입력하신 이메일을 확인해주세요!",
        });
        setMailAuth(0);
      });
  };

  const showTime = () => {
    const min = Math.floor(time / 60);
    const sec = String(time % 60).padStart(2, "0");
    return `${min}:${sec}`;
  };

  //우편번호 api
  const { open, close } = useKakaoPostcode({
    onComplete: (data) => {
      close();

      setMember({
        ...member,
        memberPostcode: data.zonecode,
        memberAddr: data.roadAddress,
        memberDetailAddr: "",
      });
      setTimeout(() => {
        close();
        detailRef.current.focus();
      }, 0);
    },
  });

  // 회원 탈퇴
  const memberDelete = () => {
    Swal.fire({
      title: "정말 탈퇴하시겠습니까?",
      text: "탈퇴 이후에는 계정의 정보를 복구할 수 없습니다.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "var(--primary)",
      cancelButtonColor: "var(--danger)",
      confirmButtonText: "예",
      cancelButtonText: "아니오",
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .delete(
            `${import.meta.env.VITE_BACKSERVER}/members/${member.memberId}`,
          )
          .then((res) => {
            if (res.data === 1) {
              Swal.fire({
                title: "탈퇴 완료되었습니다.",
                text: "이용해주셔서 감사합니다.",
                icon: "success",
              });
              useAuthStore.getState().setReady(false);
              useAuthStore.getState().logout(true);
              delete axios.defaults.headers.common["Authorization"];
              navigate("/");
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
      .patch(
        `${import.meta.env.VITE_BACKSERVER}/members/${member.memberId}`,
        member,
      )
      .then((res) => {
        Swal.fire({ title: "수정완료", icon: "success" });
        useAuthStore.getState().setThumb(res.data.memberThumb);
        useAuthStore.getState().setName(res.data.memberName);
        navigate("/member/mypage");
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <section className={styles.member_info_wrap}>
      <h3 className="page-title">내 정보</h3>

      {member !== null && memberAuthSuccess ? (
        <div className={styles.profile_info_update}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (
                newEmail === member.memberEmail &&
                (mailAuth === 0 || mailAuth === 3)
              ) {
                changeThumb();
                memberUpdate();
              } else {
                Swal.fire({ title: "이메일 인증을 완료하세요" });
              }
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
              <Button
                type="button"
                className="btn primary"
                onClick={deleteThumb}
              >
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
                  value={member.memberId}
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
                  value={newEmail}
                  readOnly={mailAuth === 1 || mailAuth === 3}
                  onChange={(e) => {
                    setNewEmail(e.target.value);
                  }}
                ></Input>
              </li>
              <li>
                <Button
                  className="btn primary"
                  type="button"
                  onClick={sendMail}
                  disabled={mailAuth === 1 || mailAuth === 3}
                >
                  {mailAuth >= 2 ? "재전송" : "인증 코드 전송"}
                </Button>
              </li>
            </ul>

            {mailAuth > 1 && (
              <ul
                className={`${styles.info_input_wrap} ${styles.member_email_auth}`}
              >
                <li>
                  <label htmlFor="mailAuthInput" className={styles.label}>
                    이메일 (E-Mail) - 인증코드
                  </label>
                </li>
                <li>
                  <Input
                    type="text"
                    name="mailAuthInput"
                    id="mailAuthInput"
                    placeholder="이메일에 도착한 인증코드를 입력하세요."
                    value={mailAuthInput}
                    onChange={(e) => setMailAuthInput(e.target.value)}
                    disabled={mailAuth === 3}
                  />
                </li>
                <li>
                  {mailAuth !== 3 && (
                    <span className={styles.timer_text}>{showTime()}</span>
                  )}
                </li>
                <li>
                  <Button
                    className="btn primary sm"
                    type="button"
                    disabled={mailAuth === 3}
                    onClick={() => {
                      if (
                        mailAuthCode === mailAuthInput &&
                        mailAuthInput !== ""
                      ) {
                        setMailAuth(3);
                        setMember({ ...member, memberEmail: newEmail });
                        window.clearInterval(timerRef.current);
                        Swal.fire({
                          icon: "success",
                          title: "인증 성공",
                          text: "이메일 인증이 완료되었습니다.",
                        });
                      } else {
                        Swal.fire({
                          icon: "error",
                          title: "인증 실패",
                          text: "인증코드가 올바르지 않습니다.",
                        });
                      }
                    }}
                  >
                    인증하기
                  </Button>
                </li>
                {mailAuth === 3 && (
                  <li>
                    <p className={`${styles.validation_msg} ${styles.valid}`}>
                      인증되었습니다.
                    </p>
                  </li>
                )}
              </ul>
            )}

            <ul
              className={`${styles.info_input_wrap} ${styles.member_postcode}`}
            >
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
              <li>
                <Button type="button" className="btn primary" onClick={open}>
                  주소 찾기
                </Button>
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
                  onChange={(e) => {
                    setMember({ ...member, memberDetailAddr: e.target.value });
                  }}
                ></Input>
              </li>
            </ul>
            <div className={styles.member_delete_button_wrap}>
              <Button
                type="button"
                className="btn primary outline"
                onClick={memberDelete}
              >
                회원탈퇴
              </Button>
            </div>
            <Button type="submit" className="btn primary lg">
              내 정보 수정
            </Button>
          </form>
        </div>
      ) : (
        <div className={styles.profile_info}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              auth();
            }}
            autoComplete="off"
          >
            <div className={styles.member_auth_pw}>
              <p>비밀번호</p>
              <Input
                type="password"
                name="memberPw"
                id="memberPw"
                placeholder="비밀번호를 입력하세요."
                value={memberAuth.memberPw}
                onChange={inputMember}
                autoComplete="off"
              ></Input>
            </div>
            <Button type="submit" className="btn primary lg">
              내 정보 수정
            </Button>
          </form>
        </div>
      )}
    </section>
  );
};

export default MemberInfo;
