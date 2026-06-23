import { useEffect, useState } from "react";
import styles from "./ColorShop.module.css";
import axios from "axios";
import useAuthStore from "../utils/useAuthStore";
import Button from "../ui/Button";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const ColorShop = () => {
  const { memberName, memberId, hexCode } = useAuthStore();
  const [colorList, setColorList] = useState([]);
  const [selectColor, setSelectColor] = useState(null);
  const [selectColorId, setSelectColorId] = useState(null);
  const [memberScore, setMemberScore] = useState(0);
  const [memberColor, setMemberColor] = useState({
    memberId: memberId,
    colorId: null,
  });

  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BACKSERVER}/mypages/color`)
      .then((res) => {
        setColorList(res.data);
      })
      .catch((err) => {
        console.log(err);
      });

    axios
      .get(`${import.meta.env.VITE_BACKSERVER}/members/${memberId}`)
      .then((res) => {
        setMemberScore(res.data.memberScore);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  const purchaseColor = () => {
    {
      hexCode === selectColor
        ? Swal.fire({
            icon: "error",
            title: "현재 사용 중인 색상입니다",
          })
        : memberScore >= 1000
          ? axios
              .patch(
                `${import.meta.env.VITE_BACKSERVER}/mypages/color`,
                memberColor,
              )
              .then((res) => {
                useAuthStore.getState().setHexCode(selectColor);
                navigate("/member/mypage");
                Swal.fire({
                  icon: "success",
                  title: "닉네임 색상 변경 완료",
                });
              })
              .catch((err) => {
                console.log(err);
              })
          : Swal.fire({
              icon: "error",
              title: "탄소 기여도 포인트가 부족합니다",
              text: "현재 탄소 기여도 포인트를 확인하세요.",
            });
    }
  };

  return (
    <section className={styles.member_info_wrap}>
      <h3 className="page-title">닉네임 색상 상점</h3>

      <CarbonContributionView memberScore={memberScore} />
      <div className={styles.color_preview}>
        <span className={styles.label}>미리보기</span>
        <h1 style={{ color: selectColor }}>{memberName}</h1>
        <h1 style={{ color: selectColor }}>{memberId}</h1>
      </div>
      <ColorList
        colorList={colorList}
        setSelectColor={setSelectColor}
        setMemberColor={setMemberColor}
      />
      <p>
        닉네임 색상 변경 시 1,000포인트가 차감되며, 기본 색상으로 되돌리는
        경우에도 동일하게 1,000포인트가 소모됩니다.
      </p>
      <div className={styles.return_wrap}>
        <div className={styles.basic_color}>
          <p>기본 컬러</p>
          <div
            className={`${styles.color_div} ${selectColorId === styles.selected}`}
            style={{
              backgroundColor: "#000",
            }}
            onClick={() => {
              setMemberColor((prev) => ({
                ...prev,
                colorId: null,
              }));
              setSelectColor("#000");
            }}
          ></div>
        </div>
        <div
          className={styles.color_div_select}
          style={{
            backgroundColor: selectColor,
          }}
        ></div>
        <form
          className={styles.button_wrap}
          onSubmit={(e) => {
            e.preventDefault();
            purchaseColor();
          }}
          autoComplete="off"
        >
          <Button type="submit" className="btn primary lg">
            구매하기
          </Button>
        </form>
      </div>
    </section>
  );
};

const ColorList = ({
  colorList,
  selectColorId,
  setMemberColor,
  setSelectColor,
}) => {
  return (
    <div className={styles.color_button_list}>
      {colorList.map((color) => {
        return (
          <div
            key={`color-${color.colorId}`}
            className={`${styles.color_div} ${selectColorId === color.colorId ? styles.selected : ""}`}
            style={{
              backgroundColor: color.hexCode,
            }}
            onClick={() => {
              setMemberColor((prev) => ({
                ...prev,
                colorId: color.colorId,
              }));
              setSelectColor(color.hexCode);
            }}
          ></div>
        );
      })}
    </div>
  );
};

const CarbonContributionView = ({ memberScore }) => {
  return (
    <section className={styles.carbon_contribution_wrap}>
      <p>현재 나의 탄소 기여도</p>
      <div className={styles.carbon_contribution}>
        <p>{memberScore}P</p>
      </div>
    </section>
  );
};

export default ColorShop;
