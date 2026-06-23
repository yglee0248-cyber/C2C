import { useEffect, useState } from "react";
import Button from "../ui/Button";
import { Input } from "../ui/Form";
import useAuthStore from "../utils/useAuthStore";
import styles from "./ChangePw.module.css";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const ChangePw = () => {
  const navigate = useNavigate();
  const { memberId } = useAuthStore();
  const [memberAuth, setMemberAuth] = useState({
    memberId: "",
    memberPw: "",
    memberAddr: "",
  });
  const [memberAuthSuccess, setMemberAuthSuccess] = useState(false);

  const [newPw, setNewPw] = useState("");
  const [newPwRe, setNewPwRe] = useState("");

  const [pwVisible, setPwVisible] = useState(false);
  const [pwReVisible, setPwReVisible] = useState(false);

  const inputMember = (e) => {
    setMemberAuth({ ...memberAuth, [e.target.name]: e.target.value });
  };

  const [checkPw, setCheckPw] = useState(0); // 비밀번호 확인 맞는지 틀린지 보는용도 state

  const pwCheck = () => {
    if (newPw === "") {
      // 비번 체크해서 에러 문구띄우는 state인 checkPw 0으로 초기화
      setCheckPw(0);
      return;
    }

    // 비밀번호 정규식: 영문 1개 이상, 특수문자 1개 이상 필수, 숫자 선택, 8자 이상
    const pwRegex =
      /^(?=.*[a-zA-Z])(?=.*[!@#$%^&*()_+~`\-={}\[\]:;"'<>,.?\/\\|])[a-zA-Z\d!@#$%^&*()_+~`\-={}\[\]:;"'<>,.?\/\\|]{8,}$/;

    if (!pwRegex.test(newPw)) {
      // 정규식이 false이니 형식 오류 반환
      setCheckPw(2);
      return;
    } else {
      setCheckPw(1);
      return;
    }
  };

  useEffect(() => {
    if (!memberId) return;

    axios
      .get(`${import.meta.env.VITE_BACKSERVER}/members/${memberId}`)
      .then((res) => {
        setMemberAuth((prev) => ({ ...prev, memberId: res.data.memberId }));
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

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

  // 비밀번호 변경
  const updatePw = () => {
    if (
      memberAuth.memberPw === "" ||
      memberAuth.memberPw === newPw ||
      newPw === "" ||
      newPwRe === "" ||
      newPw !== newPwRe ||
      checkPw !== 1
    ) {
      alert("비밀번호를 다시 확인해주십시오.");
      return;
    } else {
      memberAuth.memberPw = newPwRe;
    }

    axios
      .patch(`${import.meta.env.VITE_BACKSERVER}/members/update-pw`, memberAuth)
      .then((res) => {
        Swal.fire({
          icon: "success",
          title: "변경 완료",
          text: "성공적으로 비밀번호가 변경되었습니다.",
        });
        useAuthStore.getState().setReady(false);
        useAuthStore.getState().logout(true);
        delete axios.defaults.headers.common["Authorization"];
        navigate("/member/login");
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <section className={styles.member_info_wrap}>
      <h3 className="page-title">비밀번호 변경</h3>
      <div className={styles.profile_info}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            auth();
          }}
          autoComplete="off"
        >
          <ul className={styles.member_auth_pw}>
            <li>
              <p>비밀번호</p>
            </li>
            <li>
              <Input
                type="password"
                name="memberPw"
                id="memberPw"
                placeholder="비밀번호를 입력하세요."
                value={memberAuth.memberPw}
                onChange={inputMember}
                readOnly={memberAuthSuccess}
                autoComplete="off"
              ></Input>
            </li>
            <li>
              {!memberAuthSuccess && (
                <Button type="submit" className="btn primary">
                  비밀번호 확인
                </Button>
              )}
            </li>
          </ul>
        </form>
        {memberAuthSuccess && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              updatePw();
            }}
            autoComplete="off"
          >
            <ul className={styles.member_new_pw}>
              <li>
                <p>새로운 비밀번호 입력</p>
              </li>
              <li>
                <Input
                  type={pwVisible ? "text" : "password"}
                  name="memberPw"
                  id="memberPw"
                  placeholder="새로운 비밀번호를 입력하세요."
                  value={newPw}
                  onChange={(e) => {
                    setNewPw(e.target.value);
                  }}
                  onBlur={pwCheck}
                  autoComplete="off"
                ></Input>
              </li>
              <li>
                {pwVisible ? (
                  <span
                    className="material-icons"
                    onClick={() => {
                      setPwVisible(false);
                    }}
                  >
                    visibility_off
                  </span>
                ) : (
                  <span
                    className="material-icons"
                    onClick={() => {
                      setPwVisible(true);
                    }}
                  >
                    visibility
                  </span>
                )}
              </li>
            </ul>

            {memberAuth.memberPw === newPw ? (
              <ul className={styles.member_new_pw_comment}>
                <li></li>
                <li>
                  <p className={`${styles.validation_msg} ${styles.invalid}`}>
                    기존 비밀번호와 다른 비밀번호를 입력해주세요.
                  </p>
                </li>
                <li></li>
              </ul>
            ) : (
              checkPw === 2 && (
                <ul className={styles.member_new_pw_comment}>
                  <li></li>
                  <li>
                    <p className={`${styles.validation_msg} ${styles.invalid}`}>
                      비밀번호는 영문, 특수문자(필수)와 숫자(선택)로 8자
                      이상이어야 합니다.
                    </p>
                  </li>
                  <li></li>
                </ul>
              )
            )}

            <ul className={styles.member_new_pw}>
              <li>
                <p>새로운 비밀번호 확인</p>
              </li>
              <li>
                <Input
                  type={pwReVisible ? "text" : "password"}
                  name="memberPw"
                  id="memberPw"
                  placeholder="새로운 비밀번호를 입력하세요."
                  value={newPwRe}
                  onChange={(e) => {
                    setNewPwRe(e.target.value);
                  }}
                  autoComplete="off"
                ></Input>
              </li>
              <li>
                {pwReVisible ? (
                  <span
                    className="material-icons"
                    onClick={() => {
                      setPwReVisible(false);
                    }}
                  >
                    visibility_off
                  </span>
                ) : (
                  <span
                    className="material-icons"
                    onClick={() => {
                      setPwReVisible(true);
                    }}
                  >
                    visibility
                  </span>
                )}
              </li>
            </ul>
            <ul className={styles.member_check_new_pw}>
              <li></li>
              <li>
                {newPw !== "" && newPw === newPwRe ? (
                  <p className={`${styles.validation_msg} ${styles.valid}`}>
                    비밀번호가 일치합니다.
                  </p>
                ) : (
                  <p className={`${styles.validation_msg} ${styles.invalid}`}>
                    비밀번호가 일치하지 않습니다.
                  </p>
                )}
              </li>
              <li></li>
            </ul>
            <div className={styles.button_wrap}>
              <Button type="submit" className="btn primary lg">
                비밀번호 수정
              </Button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
};

export default ChangePw;
