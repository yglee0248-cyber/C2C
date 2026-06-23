import { useEffect, useRef } from "react";
import styles from "./MarketMap.module.css";

const MarketMap = ({ market }) => {
  const marketMapRef = useRef(null);

  useEffect(() => {
    if (!marketMapRef.current || !window.naver || !market?.sellAddr) return;

    const marketMap = new naver.maps.Map(marketMapRef.current, {
      center: new naver.maps.LatLng(37.5665, 126.978), // 초기값 (서울)
      zoom: 16,
    });

    naver.maps.Service.geocode(
      {
        query: market.sellAddr,
      },
      function (status, response) {
        if (status !== naver.maps.Service.Status.OK) {
          console.error("주소 변환 실패");
          return;
        }

        if (!response.v2.addresses.length) {
          console.error("주소 결과 없음");
          return;
        }

        const addr = response.v2.addresses[0];
        const lat = parseFloat(addr.y);
        const lng = parseFloat(addr.x);

        const position = new naver.maps.LatLng(lat, lng);

        marketMap.setCenter(position);

        const marker = new naver.maps.Marker({
          position: position,
          map: marketMap,
        });

        const infoWindow = new naver.maps.InfoWindow({
          content: `
        <div class="MarketMapInfo">
          <h3 class="MarketMapTitle">${market.marketTitle}</h3>
          <p class="MarketMapAddr">${market.sellAddr}</p>
          <div class="MarketMapWrap">
            <p class="MarketMapPrice">${market.sellPrice.toLocaleString("ko-KR")}원</p>
            <p class="MarketMapWriter">판매자 : ${market.marketWriter}</p>
          </div>
        </div>
        `,
        });

        const infoOnOff = () => {
          if (infoWindow.getMap()) {
            infoWindow.close();
          } else {
            infoWindow.open(marketMap, marker);
          }
        };

        naver.maps.Event.addListener(marker, "click", infoOnOff);
      },
    );

    // 지도 클릭 시 center 이동
    naver.maps.Event.addListener(marketMap, "click", (e) => {
      marketMap.setCenter(e.coord);
    });
  }, [market.sellAddr]);
  return <div className={styles.map} ref={marketMapRef}></div>;
};
export default MarketMap;
