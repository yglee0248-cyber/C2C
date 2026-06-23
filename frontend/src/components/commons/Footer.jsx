import { Link } from "react-router-dom";
import styles from "./Commons.module.css";

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footer_container}>
        <div className={styles.company_info}>
          <div className={styles.footer_logo}>C2C</div>
          <div className={styles.info_text}>
            <p>(주)AED | 대표: 누구게 | 사업자등록번호: 010-9274-1409</p>
            <p>서울특별시 에코구 자원순환대로 77, 1층 (지구동)</p>
            <p>고객센터: 1588-0000 | 이메일: yglee0248@gmail.com</p>
            <p>개인정보관리책임자: 누구게 | 호스팅서비스사업자: (주)AED</p>
            <p className={styles.copyright}>
              © 2026 AED Inc. All rights reserved.
            </p>
          </div>
        </div>

        <div className={styles.sns_zone}>
          <span className={styles.follow_text}>Follow us</span>
          <div className={styles.sns_icons}>
            <span className="material-icons">language</span>
            <span className="material-icons">facebook</span>
            <span className="material-icons">public</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
