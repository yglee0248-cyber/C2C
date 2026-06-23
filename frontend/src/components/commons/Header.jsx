import { Link, useNavigate } from "react-router-dom";
import styles from "./Commons.module.css";
import Button from "../ui/Button";
import useAuthStore from "../utils/useAuthStore";
import axios from "axios";
import ForumIcon from "@mui/icons-material/Forum";

const Header = () => {
  const navigate = useNavigate();

  const memberId = useAuthStore((state) => state.memberId);

  return (
    <header className={styles.header}>
      <div className={styles.header_top}>
        <div className={styles.site_logo}>
          <Link to="/">
            <img src="/logo.png" alt="C2C 로고" className={styles.logo} />
          </Link>
        </div>

        <div className={styles.member_link_zone}>
          {memberId ? (
            <>
              <div
                className={styles.chat_btn}
                onClick={() => navigate("/my/chat/page")}
              >
                <ForumIcon />
              </div>
              <Button
                className="btn primary outline"
                onClick={() => navigate("/member/mypage")}
              >
                마이페이지
              </Button>
              <Button
                className="btn primary"
                onClick={() => {
                  useAuthStore.getState().logout(); // token(key) 삭제(비우기)
                  delete axios.defaults.headers.common["Authorization"];
                  navigate("/");
                }}
              >
                로그아웃
              </Button>
            </>
          ) : (
            <>
              <Button
                className="btn primary outline"
                onClick={() => navigate("/member/login")}
              >
                로그인
              </Button>
              <Button
                className="btn primary"
                onClick={() => navigate("/member/join")}
              >
                회원가입
              </Button>
            </>
          )}
        </div>
      </div>

      <div className={styles.header_bottom}>
        <nav className={styles.nav}>
          <ul>
            <li>
              <Link to="/market">중고거래</Link>
            </li>
            <li>
              <Link to="/community">커뮤니티</Link>
            </li>
            <li>
              <Link to="/map">그린리턴 맵</Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
