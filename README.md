# AED / C2C

탄소 절감 중고거래 및 지역 커뮤니티 플랫폼

## 프로젝트 개요

* 지역 기반 중고거래, 커뮤니티, 친환경 위치 서비스를 포함한 팀 프로젝트
* 회원 인증, 게시글 / 댓글, 지도 기반 위치 서비스, 커뮤니티 기능을 포함한 웹 서비스
* KH 정보교육원 세미 프로젝트

## 프로젝트 기간

2026.03.24 ~ 2026.04.22

## 팀 구성

5인 팀 프로젝트

## 저장소

https://github.com/yglee0248-cyber/C2C

## 이영민 담당 역할

* 팀장
* Git 관리
* 더미 데이터 삽입
* 회원가입
* 로그인 / 로그아웃
* 아이디 / 비밀번호 찾기
* 메인 페이지 글 목록 출력
* 거래 게시판 댓글
* 커뮤니티 게시판 댓글
* 그린리턴 위치 서비스 맵

## 기술 스택

* Backend: Java, Spring Boot, MyBatis, REST API
* Database: Oracle, SQL Developer
* Frontend: React, JavaScript, HTML, CSS, MUI
* Build / Runtime: Maven, Apache Tomcat
* API / Integration: Naver Map API, Kakao Postcode API, Public Data API
* Collaboration: Git, GitHub, Slack

## 주요 구현 내용

이영민 담당 기능 기준으로 정리했습니다.

### 1. 회원가입 / 로그인 / 계정 찾기

* 회원가입 입력값 검증
* 아이디 중복 체크
* 이메일 인증 및 인증 시간 처리
* 비밀번호 암호화
* JWT 기반 로그인
* 로그아웃 처리
* 아이디 찾기 및 임시 비밀번호 발급 흐름

### 2. 메인 페이지 글 목록 출력

* 공지사항 목록 출력
* 최근 거래글 목록 출력
* 인기 거래글 또는 인기 게시글 목록 출력
* 메인 화면에서 주요 데이터가 조회되어 표시되는 흐름 구현

### 3. 댓글 기능

* 거래 게시판 댓글 작성 / 조회 / 수정 / 삭제
* 커뮤니티 게시판 댓글 작성 / 조회 / 수정 / 삭제
* 답글 처리
* 신고 처리
* 좋아요 / 싫어요 등 댓글 상호작용 처리
* 본인 댓글 기준 수정 / 삭제 제어

### 4. 그린리턴 위치 서비스 맵

* 지도 기반 위치 표시
* 로그인 사용자의 주소 기준 위치 처리
* 비로그인 사용자의 기본 위치 처리
* 외부 API 지역명 차이 매핑 처리
* 지역 기준 친환경 거점 조회 및 마커 / 정보창 표시

## 트러블슈팅

### 1. 이메일 인증 타이머 리렌더링 최적화

* 문제: 회원가입 화면의 이메일 인증 타이머가 매초 갱신되며 입력 폼 전체가 불필요하게 다시 렌더링되는 문제가 있었습니다.
* 원인: 타이머 상태가 회원가입 폼의 주요 상태와 같은 범위에서 관리되어, 초 단위 변경이 화면 전체 갱신으로 이어졌습니다.
* 해결: 타이머 표시 상태를 분리하고 interval 정리 로직을 명확히 두어 인증 시간만 갱신되도록 구조를 조정했습니다.
* 결과: 회원가입 입력값은 안정적으로 유지하면서 인증 남은 시간만 갱신되어 화면 조작감이 개선되었습니다.

### 2. 그린리턴 맵 지역명 데이터 불일치 해결

* 문제: 지도 API에서 얻은 지역명과 공공데이터 API의 지역명이 일부 달라 친환경 거점 데이터 조회가 누락되었습니다.
* 원인: 행정구역 명칭 표기 방식이 API마다 달랐고, 그대로 요청하면 공공데이터 조회 조건과 일치하지 않았습니다.
* 해결: 프론트엔드에서 지역명 매핑 테이블을 두고 지도 API 지역명을 공공데이터 API 요청에 맞는 명칭으로 변환했습니다.
* 결과: 지도 위치 기준으로 지역 내 친환경 거점 데이터를 안정적으로 조회하고 마커 / 정보창으로 표시할 수 있게 되었습니다.

## 환경변수 설정

프론트엔드는 `frontend/.env.example`을 참고해 로컬에서 `frontend/.env` 파일을 생성해야 합니다.

* 실제 API Key, Secret, Token, DB 접속정보는 GitHub에 올리지 않습니다.
* `.env` 파일은 Git에 포함하지 않습니다.
* `.env.example`에는 실행에 필요한 변수명과 placeholder만 작성합니다.
* 이미 공개 저장소에 올라간 키가 있다면 재발급 또는 폐기 후 새 키를 사용해야 합니다.

```bash
cd frontend
cp .env.example .env
```

백엔드는 `backend/src/main/resources/application.properties`에서 Oracle DB, 이메일 발송 계정, JWT Secret, 파일 업로드 경로를 로컬 환경에 맞게 설정해야 합니다. 공개 저장소에는 실제 접속정보나 계정정보를 남기지 않습니다.

## 실행 방법

### Backend

```bash
cd backend
./mvnw spring-boot:run
```

Windows PowerShell에서는 아래 명령을 사용할 수 있습니다.

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

백엔드는 기본 설정 기준 `http://localhost:9999`에서 실행됩니다.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

프론트엔드 개발 서버는 `vite.config.js` 기준으로 `http://localhost:5173`에서 실행됩니다.

## 보안 주의

* `.env` 파일은 Git에 포함하지 않습니다.
* API Key, Secret, Token, DB 접속정보는 공개 저장소에 올리지 않습니다.
* `.env.example`에는 실제 값이 아닌 placeholder만 작성합니다.
* 이미 공개 저장소에 올라간 키가 있다면 해당 서비스에서 재발급 또는 폐기해야 합니다.
* 기존에 Git 추적 대상이었던 `.env` 파일은 아래 명령으로 추적 해제할 수 있습니다.

```bash
git rm --cached frontend/.env
```
