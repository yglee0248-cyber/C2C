import { useRef, useState } from "react";
import styles from "./Find_pw.module.css";
import { Input } from "../../components/ui/Form";
import Button from "../../components/ui/Button";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate, Link } from "react-router-dom";

const Find_pw = () => {
  const navigate = useNavigate();

  const [member, setMember] = useState({
    memberId: "",
    memberEmail: "",
  });

  const [authCode, setAuthCode] = useState(""); // 서버에서 준 인증번호 담기

  const [inputCode, setInputCode] = useState(""); // 사용자가 입력한 인증번호 담기

  const [isSend, setIsSend] = useState(false); // 이메일 발송 여부 (true일시 인증번호 input이 생김)

  const [isVerified, setIsVerified] = useState(false); // 인증 완료 여부 (true일시 이메일과 인증번호 input을 disable함)

  const [timeLeft, setTimeLeft] = useState(300); // 5분 타이머

  const timerRef = useRef(null); // 타이머 스위치

  const inputChange = (e) => {
    // 이젠 너무 익숙한 value에 있는 값을 member에 넣는 방법
    setMember({ ...member, [e.target.name]: e.target.value });
  };

  const formatTime = (time) => {
    // 분 : 초 세팅
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const sendMail = () => {
    if (member.memberEmail === "") {
      Swal.fire({
        icon: "warning",
        title: "이메일 입력",
        text: "이메일을 먼저 입력해주세요.",
      });
      return;
    }

    setTimeLeft(300); // 타이머 재설정
    setAuthCode(""); // 서버에서 준 코드 비우기
    setInputCode(""); // 사용자가 입력한 코드 비우기

    if (timerRef.current) window.clearInterval(timerRef.current);

    Swal.fire({ title: "메일 발송 중...", didOpen: () => Swal.showLoading() });

    axios
      .post(`${import.meta.env.VITE_BACKSERVER}/members/email-verification`, {
        memberEmail: member.memberEmail,
      })
      .then((res) => {
        Swal.fire({
          icon: "success",
          title: "발송 완료",
          text: "이메일로 인증번호가 발송되었습니다.",
        });
        setAuthCode(res.data);
        setIsSend(true); // 입력창 열기

        // 인증코드 인증시간이 넘었을때를 위해 타이머 가동!
        timerRef.current = window.setInterval(() => {
          setTimeLeft((prev) => {
            if (prev <= 1) {
              window.clearInterval(timerRef.current); // 타이머 끄기
              Swal.fire({
                icon: "warning",
                title: "시간 초과",
                text: "인증 시간이 만료되었습니다. 다시 시도해주세요.",
              });
              setAuthCode(""); // 서버에서 준 인증번호 초기화
              setInputCode(""); // 사용자가 입력했던 인증번호 초기화
              setIsSend(false); // 입력창 다시 닫기
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
      });
  };

  // 2. 인증번호 확인 (아이디 찾기와 동일)
  const verifyCode = () => {
    if (authCode === inputCode && inputCode !== "") {
      Swal.fire({
        icon: "success",
        title: "인증 성공",
        text: "이메일 인증이 완료되었습니다.",
      });
      setIsVerified(true);
      window.clearInterval(timerRef.current); // 인증성공 -> 타이머 stop
    } else {
      Swal.fire({
        icon: "error",
        title: "인증 실패",
        text: "인증번호가 일치하지 않습니다.",
      });
      setIsVerified(false);
    }
  };

  // 1. 위에서부터 순서대로 체크해서 sweetalert 띄우기
  const findPwAction = () => {
    if (member.memberId === "" || member.memberEmail === "") {
      Swal.fire({
        icon: "warning",
        title: "입력 오류",
        text: "아이디와 이메일을 모두 입력해주세요.",
      });
      return;
    }
    if (!isVerified) {
      Swal.fire({
        icon: "warning",
        title: "인증 필요",
        text: "이메일 인증을 먼저 완료해주세요.",
      });
      return;
    }

    Swal.fire({
      title: "임시 비밀번호 생성 중...",
      didOpen: () => Swal.showLoading(),
    });

    axios
      .post(`${import.meta.env.VITE_BACKSERVER}/members/find-pw`, member)
      .then((res) => {
        // 성공 시 팝업 띄우고 로그인 페이지로 이동
        Swal.fire({
          icon: "success",
          title: "발송 완료",
          html: "가입하신 이메일로 임시 비밀번호가 발송되었습니다. <br />로그인 후 비밀번호를 꼭 변경해주세요!!!",
          confirmButtonText: "로그인하러 가기",
        }).then((result) => {
          if (result.isConfirmed) navigate("/member/login");
        });
      })
      .catch((err) => {
        console.log(err);
        Swal.fire({
          icon: "error",
          title: "조회 실패",
          text: "입력하신 정보와 일치하는 계정이 없습니다.",
        });
      });
  };

  return (
    <section className={styles.find_section}>
      <div className={styles.find_card}>
        <div className={styles.info_panel}>
          <h2 className={styles.welcome_title}>Welcome to</h2>
          <h1 className={styles.brand_title}>C2C</h1>
          <p className={styles.sub_title}>
            (Customer to Carbon)
            <br />
            지구를 구하는 작은 습관,
            <br />
            지금 동네에서 시작해보세요.
          </p>
        </div>

        <div className={styles.form_panel}>
          <h3 className={styles.page_title}>계정찾기</h3>

          <div className={styles.tab_menu}>
            <Link to="/member/find-id" className={styles.tab_item}>
              아이디 찾기
            </Link>
            <div className={`${styles.tab_item} ${styles.active}`}>
              비밀번호 찾기
            </div>
          </div>

          <p className={styles.info_text}>
            가입 시 등록한 아이디와 이메일을 입력하시면,
            <br />
            해당 이메일로 임시 비밀번호를 발송해 드립니다.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              findPwAction();
            }}
          >
            <div className={styles.form_group}>
              <label htmlFor="memberId" className={styles.label}>
                아이디
              </label>
              <Input
                type="text"
                name="memberId"
                id="memberId"
                placeholder="가입하신 ID를 입력해주세요."
                value={member.memberId}
                onChange={inputChange}
              />
            </div>

            <div className={styles.form_group}>
              <label htmlFor="memberEmail" className={styles.label}>
                이메일 (E-Mail)
              </label>
              <div className={styles.input_button_row}>
                <div className={styles.input_box}>
                  <Input
                    type="email"
                    name="memberEmail"
                    id="memberEmail"
                    placeholder="가입하신 이메일을 입력해주세요."
                    value={member.memberEmail}
                    onChange={inputChange}
                    disabled={isSend || isVerified}
                  />
                </div>
                <Button
                  type="button"
                  className="btn primary outline"
                  onClick={sendMail}
                  disabled={isVerified}
                >
                  {isSend ? "재전송" : "인증번호 받기"}
                </Button>
              </div>
            </div>

            {isSend && !isVerified && (
              <div className={styles.form_group}>
                <div className={styles.input_button_row}>
                  <div
                    className={styles.input_box}
                    style={{ position: "relative" }}
                  >
                    <Input
                      type="text"
                      name="inputCode"
                      id="inputCode"
                      placeholder="인증번호 6자리 입력"
                      value={inputCode}
                      onChange={(e) => setInputCode(e.target.value)}
                    />
                    <span className={styles.timer_text}>
                      {formatTime(timeLeft)}
                    </span>
                  </div>
                  <Button
                    type="button"
                    className="btn primary"
                    onClick={verifyCode}
                  >
                    인증하기
                  </Button>
                </div>
              </div>
            )}

            <div className={styles.button_wrap}>
              <Button type="submit" className="btn primary lg">
                임시 비밀번호 전송
              </Button>
            </div>

            <div className={styles.login_link_wrap}>
              <span className={styles.helper_text}>
                비밀번호가 기억나셨나요?
              </span>
              <Link to="/member/login" className={styles.login_link}>
                로그인하러가기
              </Link>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Find_pw;
