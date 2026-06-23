import { useState } from "react";
import styles from "./Login.module.css";
import { Input } from "../../components/ui/Form";
import Button from "../../components/ui/Button";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate, Link } from "react-router-dom";
import useAuthStore from "../../components/utils/useAuthStore";

const Login = () => {
  const navigate = useNavigate();

  const [member, setMember] = useState({ memberId: "", memberPw: "" }); // member 정보를 담는 용도의 state

  const [pwVisible, setPwVisible] = useState(false); // 비번 숨김 / 보임용

  const inputMember = (e) => {
    // 이젠 너무 익숙한 value에 있는 값을 member에 넣는 방법
    setMember({ ...member, [e.target.name]: e.target.value });
  };

  const login = () => {
    if (member.memberId === "" || member.memberPw === "") {
      Swal.fire({
        icon: "warning",
        title: "입력 오류",
        text: "아이디와 비밀번호를 모두 입력해주세요.",
      });
      return;
    }

    axios
      .post(`${import.meta.env.VITE_BACKSERVER}/members/login`, member)
      .then((res) => {
        useAuthStore.getState().login(res.data);
        axios.defaults.headers.common["Authorization"] = res.data.token;

        Swal.fire({
          icon: "success",
          title: "로그인 성공!",
          text: `${res.data.memberName}님 환영합니다!`,
        });
        navigate("/");
      })
      .catch((err) => {
        console.log(err);
        Swal.fire({
          icon: "error",
          title: "로그인 실패",
          text: "아이디 또는 비밀번호를 확인하세요.",
        });
      });
  };

  return (
    <section className={styles.login_section}>
      <div className={styles.login_card}>
        <h3 className={styles.page_title}>로그인</h3>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            login();
          }}
          autoComplete="off"
        >
          <div className={styles.form_group}>
            <label htmlFor="memberId" className={styles.label}>
              아이디
            </label>
            <div className={styles.input_row}>
              <Input
                type="text"
                name="memberId"
                id="memberId"
                placeholder="ID를 입력하세요."
                value={member.memberId}
                onChange={inputMember}
              />
            </div>
          </div>

          <div className={styles.form_group}>
            <label htmlFor="memberPw" className={styles.label}>
              비밀번호
            </label>
            <div className={styles.input_row}>
              <Input
                type={
                  pwVisible ? "text" : "password"
                } /* 💡 상태에 따라 text/password 전환 */
                name="memberPw"
                id="memberPw"
                placeholder="비밀번호를 입력하세요."
                value={member.memberPw}
                onChange={inputMember}
              />
              {pwVisible ? (
                <span
                  className={`material-icons ${styles.pw_icon}`}
                  onClick={() => setPwVisible(false)}
                >
                  visibility_off
                </span>
              ) : (
                <span
                  className={`material-icons ${styles.pw_icon}`}
                  onClick={() => setPwVisible(true)}
                >
                  visibility
                </span>
              )}
            </div>
          </div>

          <div className={styles.find_link_wrap}>
            <Link to="/member/find-id">아이디 찾기</Link>
            <Link to="/member/find-pw">비밀번호 찾기</Link>
          </div>

          <div className={styles.button_row}>
            <Button className="btn primary lg" type="submit">
              로그인
            </Button>
            <Button
              className="btn primary lg"
              type="button"
              onClick={() => navigate("/member/join")}
            >
              회원가입
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default Login;
