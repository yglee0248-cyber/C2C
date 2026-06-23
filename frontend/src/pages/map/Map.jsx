import { useEffect, useRef, useState } from "react";
import styles from "./Map.module.css";
import { Input } from "../../components/ui/Form";
import Button from "../../components/ui/Button";
import { useKakaoPostcode } from "@clroot/react-kakao-postcode";
import axios from "axios";
import useAuthStore from "../../components/utils/useAuthStore";

const Map = () => {
  const mapDivRef = useRef(null); // 화면의 지도 ref (div에 연결됨)
  const markersRef = useRef([]); // 화면의 마커 ref

  const mapObjRef = useRef(null); // 네이버 지도 객체 자체를 저장 (나중에 지도 중심 이동할 때 씀 -> 실시간으로 바꾸기위해 state대신 ref활용)
  const [infoWindowObj, setInfoWindowObj] = useState(null); // marker 클릭시 나오는 정보창 객체를 저장
  const [searchAddr, setSearchAddr] = useState(""); // 인풋창에 보여질 주소 텍스트

  // 카카오의 줄임말을 공공데이터용 풀네임으로 바꿔주는 번역기 -> 여기 없는건 카카오의 줄임말이어도 검색이 되기떄문에(이거 하나하나 찾는대만 몇십분이나..)
  const SIDO_MAP = {
    전남: "전라남도",
    경남: "경상남도",
    경북: "경상북도",
    충남: "충청남도",
    충북: "충청북도",
  };

  const { memberId, memberAddr } = useAuthStore(); // 로그인 되어 있는지 확인용, 주소..도 확인은 하는데 (DB에서 not null이긴해서 형식상 확인)

  // 맨 처음 한번만 실행되며 첫 화면 세팅
  useEffect(() => {
    if (!mapDivRef.current || !window.naver) return; // div에 연결된 지도가 없거나 뭐지 네이버 api를 못 불러오면 return

    // 정보창 세팅
    const infoWindow = new window.naver.maps.InfoWindow({
      content: "",
      backgroundColor: "var(--gray8)",
      borderWidth: 1,
      borderColor: "var(--secendary)",
      anchorSize: new window.naver.maps.Size(10, 10),
    });
    setInfoWindowObj(infoWindow);

    const center = new window.naver.maps.LatLng(37.554648, 126.972559); // 서울역을 중심으로
    const map = new window.naver.maps.Map(mapDivRef.current, {
      center: center,
      zoom: 15,
    });
    // 지도를 저장하는 객체에 위에서 만든 map이라는 지도 정보 넣기
    mapObjRef.current = map;

    // 정보창 없애는 로직(지도 아무대나 클릭시) -> 이거 없으면 난리나거나 정보창이 안사라짐(불편해짐)
    window.naver.maps.Event.addListener(map, "click", () => {
      infoWindow.close();
    });

    // 유저 상태 확인 (현재 로그인되어있고 주소가 있으면 if문 실행)
    if (memberId && memberAddr) {
      // https://api.ncloud-docs.com/docs/ai-naver-mapsgeocoding-geocode
      // https://navermaps.github.io/maps.js.ncp/docs/naver.maps.Service.html 위랑 여기 2 사이트 참고해서 만듬
      // 주소를 좌표로 변환해서 이동(panTo)함.

      window.naver.maps.Service.geocode(
        { query: memberAddr },

        (status, response) => {
          // status : 응답 결과에 대한 상태 코드
          // response : 응답 본문
          // Status.ok : 응답 결과가 200으로 잘 들어오고 respone.v2.addresses.length : 주소 검색 결과 목록의 길이가 0보다 크면 함수 실행(함수에 이 if문밖에 없으니)
          // 헷갈리면 안되는것 이건 로그인 정보를 가진 유저의 주소로 가기 위함임
          if (
            status === window.naver.maps.Service.Status.OK &&
            response.v2.addresses.length > 0
          ) {
            const { x, y, addressElements } = response.v2.addresses[0]; // 주소 검색 결과의 1번 컬럼의 x, y : 경/위도 addressElements : 주소를 이루는 요소들

            // 주소요소중 SIDO라는걸 찾아서 sidoElement에 넣기
            const sidoElement = addressElements.find((e) =>
              e.types.includes("SIDO"),
            );
            // shortName / longName / code 라는 요소 type들이 있던데  각각 지번, 도로명, 우편번호인줄 알았는데
            // 더 심플하게 longName = 전체이름 (예 : "서울특별시") shortName = 짧은이름 (예 : "서울") code = 고유코드
            // 여기서 longName 왜 안써서 이리 어렵게 코드를 짰냐 할수 있는데 전남같은건 기본적으로 요약되어 나온 이름을 기준으로 short / long이 있어서 long(long도 전남이런식으로 있거나 아니면 너무 길게 되어 있어서 오히려 줄여야 공공데이터api와 데이터 값을 맞출수 있었다)이 의미가 없었다
            const regionName =
              SIDO_MAP[sidoElement.shortName] || sidoElement.shortName;

            // 지도의 중심을 유저 동네로 이동
            map.panTo(window.naver.maps.LatLng(y, x));

            // 해당 동네 데이터(서버에서 불러오는 거점 정보) 불러오기
            fetchGreenReturnData(map, infoWindow, regionName);
          }
        },
      );
    } else {
      // else -> 비로그인 유저 : 이미 서울역이 지도에 떠 있으니, 서울 데이터만 불러오면 끝
      fetchGreenReturnData(map, infoWindow, "서울");
    }
  }, [memberId, memberAddr]); // 유저 정보가 바뀔떄 마다(로그인 / 로그아웃) 지도 갱신

  // 공공데이터 서버에서 거점 정보 가져오기 함수
  const fetchGreenReturnData = (
    currentMap,
    sharedInfoWindow,
    regionName = "", // 지역이름이 null 혹은 비어있으면 기본값으면 "" 뭐이것도 비어있긴한데 보통 안비어있어서 밑에서 params의 지역명에 regionName으로 api에 잘 데이터를 보냄
  ) => {
    // 공공데이터api에서 요구하는 데이터중 일부 묶음
    const params = {
      pageNo: 1,
      numOfRows: 630, // 데이터가 가장 많은 서울이 630개임(기준을 서울로)
      returnType: "json",
    };

    // 지역명이 이미 있다면 api에 보내야 하는 지역명에 포함해서 보냄
    if (regionName) {
      params.positnRgnNm = regionName;
    }

    // api에 요청 보내기 -> 주소 어떻게 쓰는지 찾는대만 30분은 걸림 ㅠㅠ ai는 멍청해서 해결못하고 직접 찾아보니 더 쉬웠던...
    axios
      .get(
        `/api/B552584/kecoapi/rtrvlCmpnPositnService/getCmpnPositnInfo?serviceKey=${encodeURIComponent(import.meta.env.VITE_GREEN_RETURN_API_KEY)}`,
        { params },
      )
      .then((res) => {
        // 요청 잘 보내고 response 잘 받으면 마커 지우고
        markersRef.current.forEach((marker) => marker.setMap(null)); // 이건 마커 지우는 작업 (찍혀있는 마커가 여러개니까 전부 지우기위해 forEach)
        markersRef.current = []; // 마커는 다 지웠고 markerRef도 싹 비워주기

        const dataList = res.data.body?.items || []; // 서버에서 받은 데이터들 List로 저장하기 근데 없으면 빈배열

        // 새로운 마커 함수 (서버에서 받은 데이터의 List로 map으로 다 찍기)
        const newMarkers = dataList.map((item) => {
          // 위/경도 세팅
          const position = new window.naver.maps.LatLng(
            parseFloat(item.positnPstnLat),
            parseFloat(item.positnPstnLot),
          );

          // 마커 객체 생성
          const marker = new window.naver.maps.Marker({
            position: position, // 위에서 세팅한 위/경도
            map: currentMap, // 현재 화면의 지도에
          });

          // 마커 클릭 이벤트(정보창 뜨게)
          window.naver.maps.Event.addListener(marker, "click", () => {
            // 정보창에 뜰 내용
            const content = `
              <div style="
                padding: 15px; 
                min-width: 250px; 
                max-width: 350px; /* 가로가 너무 넓어지지 않게 제한 */
                line-height: 1.5;
              ">
                <h4 style="margin: 0 0 8px 0; color: var(--secendary);">그린리턴 거점</h4>
                <p style="margin: 0; font-size: 14px; font-weight: bold; color: var(--gray1);">${item.positnRdnmAddr}</p>
                <div style="
                  margin: 8px 0 0 0; 
                  font-size: 13px; 
                  color: var(--gray2); 
                  max-height: 120px;
                  overflow-y: auto;  /* 넘치는 내용은 아래로 스크롤되게 만듦 */
                  word-break: keep-all; /* 띄어쓰기 없어도 강제 줄바꿈 */
                ">
                  ${item.positnIntdcCn || "상세정보 없음"}
                </div>
              </div>
            `;

            // if문 : 이미 열려있는 마커가 있거나 방금 누른 마커가 현재 열려있는 정보창 마커랑 같다면 닫아라
            // else : 열려있는 마커가 없거나 내가 누른 마커가 이전과 다른 마커라면 새로운 정보창 띄우기, 마커찍기
            if (
              sharedInfoWindow.getMap() &&
              sharedInfoWindow.getPosition().equals(marker.getPosition())
            ) {
              sharedInfoWindow.close();
            } else {
              sharedInfoWindow.setContent(content);
              sharedInfoWindow.open(currentMap, marker);
            }
          });

          return marker;
        });

        // 위에서 처음에 싹 비웠었던걸 새롭게 api가 준 데이터로 만든 마커들로 채우기
        markersRef.current = newMarkers;
      })
      .catch((err) => {
        // 에러 나지마 제발 -> 보통 에러나면 api서버쪽 문제이거나 git으로 받아왔을때 일시적인 오류
        console.log("데이터 로딩 실패:", err);
      });
  };

  // 카카오 주소 검색 & 지도 이동
  const { open } = useKakaoPostcode({
    onComplete: (data) => {
      // 만약 도로명 주소가 비어있으면 일반 주소(지번)라도 가져오기(도로명이 2개이상이면 값이 안들어갈때가 있음)
      const targetAddress = data.roadAddress || data.address; // Join에서도 설명했지만 roadAddress : 도로명 주소
      setSearchAddr(targetAddress);

      const regionName = SIDO_MAP[data.sido] || data.sido; // 사전(sido_map)에 있으면 풀네임(예 : 전라남도)으로 바꾸고, 사전에 없으면(서울, 대구) 원래 이름 그대로 쓴다!

      // 네이버 지도가 잘 활성화 되있으면 실행
      if (window.naver && window.naver.maps.Service) {
        // geocode : 네이버 지도 서버에 카카오의 주소를 보냄
        window.naver.maps.Service.geocode(
          { query: targetAddress },

          // 네이버가 변환 작업이 끝내고 결과를 돌려주면 실행되는 콜백 함수
          (status, response) => {
            if (
              status === window.naver.maps.Service.Status.OK &&
              response.v2.addresses.length > 0
            ) {
              const { x, y } = response.v2.addresses[0]; // 주소 검색 결과의 1번 컬럼의 x, y : 경/위도
              const newPoint = new window.naver.maps.LatLng(y, x);

              // 위에서 만든 지도를 저장하는 객체의 현재 지도 객체를 가져옴
              const currentMap = mapObjRef.current;

              // 현재 지도가 있다면
              if (currentMap) {
                currentMap.setCenter(newPoint); // 기존에 panTo를 사용했었는데 setCenter으로 바꿈 (이유 : panTo는 부드럽게 움직이려 하는데 zoom 설정과 충돌되어 중간에 엉뚱한 곳에서 멈출때가 있었음 그래서 그냥 순간이동하는 setCenter 설정을 사용)
                currentMap.setZoom(15); // 줌은 15로 통일

                if (infoWindowObj) infoWindowObj.close();
                fetchGreenReturnData(currentMap, infoWindowObj, regionName);
              }
            } else {
              alert("해당 주소를 지도에서 찾을 수 없습니다.");
            }
          },
        );
      }
    },
  });

  return (
    <div className={styles.map_wrap}>
      <h3 className="page-title">그린리턴 맵</h3>

      <div className={styles.search_area}>
        <div className={styles.input_box}>
          <Input
            type="text"
            value={searchAddr}
            readOnly
            placeholder={memberAddr ? memberAddr : "주소를 검색하세요"}
          />
        </div>

        <Button className="btn primary" onClick={open}>
          주소 검색
        </Button>
      </div>

      <div className={styles.map_div} ref={mapDivRef}></div>
    </div>
  );
};

export default Map;
