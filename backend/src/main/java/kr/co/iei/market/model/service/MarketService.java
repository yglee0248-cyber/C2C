package kr.co.iei.market.model.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import kr.co.iei.chat.controller.StompController;
import kr.co.iei.community.controller.CommunityController;
import kr.co.iei.market.model.dao.MarketDao;
import kr.co.iei.market.model.dto.MarketCreateResponse;
import kr.co.iei.market.model.dto.MarketResponse;
import kr.co.iei.market.model.dto.MarketUpdateResponse;
import kr.co.iei.market.model.vo.CommentListItem;
import kr.co.iei.market.model.vo.ListItem;
import kr.co.iei.market.model.vo.ListResponse;
import kr.co.iei.market.model.vo.Market;
import kr.co.iei.market.model.vo.MarketComment;
import kr.co.iei.market.model.vo.MarketCommentReport;
import kr.co.iei.market.model.vo.MarketFile;
import kr.co.iei.market.model.vo.MarketReport;
import kr.co.iei.market.model.vo.ScoreHistory;
import kr.co.iei.market.model.vo.TradeRequest;
import kr.co.iei.member.model.vo.LoginMember;
import kr.co.iei.utils.CookieUtils;
import kr.co.iei.utils.FileUtils;
import kr.co.iei.utils.JwtUtils;

@Service
public class MarketService {

	@Value("${file.root}")
	private String root;
	@Autowired
	private MarketDao marketDao;
	@Autowired
	private JwtUtils jwtUtil;
	@Autowired
	private FileUtils fileUtil;
	@Autowired
	private CookieUtils cookieUtil;
	private int cookieTime = 60 * 5; // 쿠키 시간설정 5분
	private int addPoint = 100; // 거래완료시 추가할포인트

	// 메인페이지
	public List<Market> selectMainPageMarketList(Map<String, Object> params) {
		List<Market> list = marketDao.selectMainPageMarketList(params);
		return list;
	}

	// 댓글 조회
	public ListResponse selectMarketCommentList(CommentListItem item) {

		int totalCount = marketDao.selectParentCommentCount(item); // 총 부모 댓글 수 구하기 (자식 답글은 페이지 계산에서 제외)
		int totalPage = (int) Math.ceil(totalCount / (double) item.getSize()); // 총 페이지 수 계산

		List<MarketComment> list = marketDao.selectMarketCommentList(item); // 조회

		ListResponse response = new ListResponse(list, totalPage);
		return response;
	}

	// 댓글 작성
	@Transactional
	public int insertMarketComment(MarketComment marketComment) {
		int result = marketDao.insertMarketComment(marketComment);
		return result;
	}

	// 댓글 삭제
	@Transactional
	public int deleteMarketComment(Integer commentNo) {
		int result = marketDao.deleteMarketComment(commentNo);
		return result;
	}

	// 댓글 수정
	@Transactional
	public int updateMarketComment(MarketComment marketComment) {
		int result = marketDao.updateMarketComment(marketComment);
		return result;
	}

	// 댓글 신고
	@Transactional
	public int insertMarketCommentReport(MarketCommentReport report) {
		int result = marketDao.insertMarketCommentReport(report);
		return result;
	}

	/// 진호 작업영역-----------------------------------
	/// 마켓게시판 조회 <리스트>
	public ListResponse selectMarketList(ListItem request, String token) {
		// 1. 총 게시물수 구하기
		Integer totalCount = marketDao.selectMarketCount(request);
		// 2. 총 페이지수 구하기
		int totalPage = (int) Math.ceil(totalCount / (double) request.getSize());
		// 3. 토큰에서 memberId 추출 및 셋
		String memberId = null;
		if (token != null) {
			LoginMember member = jwtUtil.checkToken(token);
			if (member != null) {
				memberId = member.getMemberId();
			}
		}
		// System.out.println("로그인 아이디 : " + memberId);
		request.setMemberId(memberId);
		// 4. 리스트 받아오기
		List<Market> list = marketDao.selectMarketList(request);
		// 5. totalPage 와 리스트를 보내줄 DTO 생성
		ListResponse response = new ListResponse(list, totalPage);
		return response;
	}

	/// 마켓게시판 등록
	@Transactional
	public MarketResponse<MarketCreateResponse> insertMarket(String token, Market market, List<MultipartFile> files) {
		// 1. 토큰검증
		LoginMember member = jwtUtil.checkToken(token);
		if (member == null) {
			return new MarketResponse<>(false, "401 : 인증 필요", null);
		}
		// 2. 로그인 객체에서 아이디 추출 및 개시물 객체에 대입
		String requestId = member.getMemberId();
		market.setMarketWriter(requestId);

		// 파일체크 (로그용)
		for (MultipartFile file : files) {
			// System.out.println("\n파일명: " + file.getOriginalFilename());
			// System.out.println("크기: " + file.getSize());
			// System.out.println("타입: " + file.getContentType());
		}
		// 3. 파일 리스트 생성 및 서버에 파일추가
		List<MarketFile> fileList = new ArrayList<MarketFile>();
		if (files != null) {
			String savepath = root + "market/";
			for (MultipartFile file : files) {
				String marketFileName = file.getOriginalFilename();
				String marketFilepath = fileUtil.upload(savepath, file);

				MarketFile marketFile = new MarketFile();
				marketFile.setMarketFileName(marketFileName);
				marketFile.setMarketFilePath(marketFilepath);
				fileList.add(marketFile);
			}
		}
		// 4. 게시글 번호 생성 및 셋(시퀀스 번호 발급)
		int marketNo = marketDao.getNewMarketNo();
		market.setMarketNo(marketNo);

		// 5. 마켓 게시글 등록 (insert market_tbl)
		int result = marketDao.insertMarket(market);
		if (result == 0) {
			return new MarketResponse<>(false, "500 : DB 입력 실패", null);
		}

		// 6. 마켓 파일 DB 등록 (insert market_file_tbl)
		int fileCount = 0;
		for (MarketFile marketFile : fileList) {
			marketFile.setMarketNo(marketNo);
			fileCount += marketDao.insertMarketFile(marketFile);
		}

		// System.out.println("\n" + marketNo + " 번 게시글 업로드 결과");
		// System.out.println("게시글작성 : " + result + " , 파일업로드 갯수 : " + fileCount);
		// 7 : 결과 응답객체에 추가
		MarketCreateResponse data = new MarketCreateResponse(marketNo, fileCount);
		return new MarketResponse<>(true, "201 : 게시물 등록 성공", data);
	}

	/// 마켓게시판 조회<VO>
	public MarketResponse<Market> selectOneMarket(String token, Integer marketNo, HttpServletRequest request,
			HttpServletResponse response) {
		String memberId = null;
		int memberGrade = 0; // memberGrade : 0.비회원 1.슈퍼관리자 2.관리자 3.일반유저
		int status = 0; // status : 1.공개 2.비공개 3.삭제
		int completed = -1; // completed : 0.미완료 1.완료
		if (token != null) {
			LoginMember loginMember = jwtUtil.checkToken(token);
			// 토큰으로 로그인 객체 생성
			memberId = loginMember.getMemberId();
			// 로그인 객체에서 아이디 추출
			memberGrade = loginMember.getMemberGrade();
			// 로그인 객체에서 멤버 등급 추출
		}
		Market m = marketDao.selectOneMarket(marketNo, memberId);
		// market 객체 생성
		List<MarketFile> fileList = marketDao.selectMarketFileList(marketNo);
		// 파일 리스트 조회
		boolean alreadyViewed = cookieUtil.alreadyViewed(request, marketNo);
		// 쿠키 조회(게시물 확인 여부를 체크)
		if (m == null) {
			// 없는 경로로 요청시 리턴 null 리턴
			return new MarketResponse<>(false, "찾을수 없습니다.", null);
		} else {
			status = m.getMarketStatus();
			completed = m.getCompleted();
		}
		if (status == 2 && (memberGrade == 0 || memberGrade == 3)) {
			// 비공개 상태일때 비회원과 일반유저는 접근못하게 null 리턴
			return new MarketResponse<>(false, "비공개 게시글입니다.", null);
		}
		if (status == 2 &&(memberGrade ==2)) {
			m.setMarketTitle("[비공개 처리]" + m.getMarketTitle());
		}
			
		
		if (status == 3 && memberGrade != 1) {
			// 삭제 상태일떄 슈퍼관리자(1) 이외 유저는 접근못하게 null 리턴)
			return new MarketResponse<>(false, "삭제된 게시글입니다.", null);
		}
		if (memberId != null && memberId.equals(m.getMarketWriter())) {
			// 요청자가 판매자자신일 경우 조회수 증가없이 리턴
			m.setFileList(fileList); // 파일리스트 추가
			return new MarketResponse<>(true, "200 : 조회성공", m);
		}
		if (completed == 1 && (memberGrade == 0 || memberGrade == 3)) {
			// 게시글이 완료상태일때 비회원과 일반유저는 게시글 내용을 변경 변경
			m.setMarketContent("판매 완료된 게시물입니다.");

		} 
		if (memberGrade == 2) {
			//관리자는 조회수 증가 없이 리턴
			m.setFileList(fileList); // 파일리스트 추가
			return new MarketResponse<>(true, "200 : 조회성공", m);
		}
		/*
		if (memberGrade==3 && status == 3) {
			//슈퍼관리자는 수정 삭제된 모든 파일을 가져옴, 조회수 증가 없음
			//m.setMarketTitle("[삭제]" + m.getMarketTitle());
						
		}
		*/
	
		if (!alreadyViewed) {
			// 쿠키 조회 결과 false 일 경우 조회수 증가
			marketDao.incrementViewCount(marketNo); // 조회수증가
			m.setViewCount(m.getViewCount() + 1); // 조회수보정
			cookieUtil.createCookie(response, marketNo, cookieTime); // 쿠키생성
		}
		
		m.setFileList(fileList); // 파일추가
		return new MarketResponse<Market>(true, "200 : 조회성공", m);
	}

	/// 마켓 게시판 수정
	@Transactional
	public MarketResponse<MarketUpdateResponse> updateOneMarket(String token, Market market, List<MultipartFile> files,
			Integer marketNo) {

		if (token == null) {
			return new MarketResponse<MarketUpdateResponse>(false, "토큰 없음", null);
		}
		LoginMember loginMember = jwtUtil.checkToken(token);
		if (loginMember == null) {
			return new MarketResponse<MarketUpdateResponse>(false, "유효하지 않은 토큰", null);
		}
		String memberId = loginMember.getMemberId();
		String writer = marketDao.getMarketWriter(marketNo);
		if (!memberId.equals(writer)) {
			return new MarketResponse<MarketUpdateResponse>(false, "작성자 불일치", null);
		}
		market.setMarketNo(marketNo);
		int result = marketDao.updateMarket(market);
		int newFileCount = 0;
		if (result == 1) {
			List<MarketFile> addFileList = new ArrayList<MarketFile>();
			if (files != null) {
				String savepath = root + "market/";
				for (MultipartFile file : files) {
					String marketFileName = file.getOriginalFilename();
					String marketFilePath = fileUtil.upload(savepath, file);
					MarketFile marketFile = new MarketFile();
					marketFile.setMarketFileName(marketFileName);
					marketFile.setMarketFilePath(marketFilePath);
					marketFile.setMarketNo(marketNo);
					addFileList.add(marketFile);
				}
				for (MarketFile marketFile : addFileList) {
					newFileCount += marketDao.insertMarketFile(marketFile);
				}
			}

		} else {
			return new MarketResponse<MarketUpdateResponse>(false, "marketDB 업데이트 실패", null);
		}
		// 파일DB삭제
		//List<MarketFile> history = new ArrayList<>();
		int deleteFileCount = 0;
		if (market.getDeleteFilePath() != null) {
			for (String marketFilePath : market.getDeleteFilePath()) {
				//MarketFile getHistoryFile = marketDao.getHistoryMarketFile(marketFilePath);
				//history.add(getHistoryFile);
				deleteFileCount += marketDao.deleteMarketFile(marketFilePath);
							
			}
			//marketDao.insertHistoryMarketFile(history);
		}
		
		// 파일은DB에 남겨둠
		MarketUpdateResponse data = new MarketUpdateResponse(newFileCount, deleteFileCount);

		return new MarketResponse<MarketUpdateResponse>(true, "성공", data);
	}

	@Transactional // 좋아요 클릭
	public int likeOn(Integer marketNo, String token) {
		LoginMember loginMember = jwtUtil.checkToken(token);
		Map<String, Object> params = new HashMap<String, Object>();
		params.put("marketNo", marketNo);
		params.put("memberId", loginMember.getMemberId());
		int result = marketDao.likeOn(params);
		return result;
	}

	@Transactional // 좋아요 해제
	public int likeOff(Integer marketNo, String token) {
		LoginMember loginMember = jwtUtil.checkToken(token);
		Map<String, Object> params = new HashMap<String, Object>();
		params.put("marketNo", marketNo);
		params.put("memberId", loginMember.getMemberId());
		int result = marketDao.likeOff(params);
		return result;
	}

	// 거래삭제시 파일패스 리스트 가져오기
	public List<String> getFilePath(Integer marketNo) {
		List<String> fileList = marketDao.getFilePath(marketNo);
		return fileList;
	}

	// 거래요청 목록조회
	public List<TradeRequest> selectAllTradeRequest(Integer marketNo) {
		List<TradeRequest> list = marketDao.selectAllTradeRequest(marketNo);
		return list;
	}

	// 거래확정
	@Transactional
	public int tradeComplete(Integer marketNo, String buyerId) {
		// 1. buyerId = 거래완료(Status = 2) completed_date = sysdate
		int result1 = marketDao.tradeAccepted(marketNo, buyerId);
		
		// 2. !buyerId = 거래거절(Status = 3) completed_date = sysdate (거래요청 수만큼 반환)
		int result2 = marketDao.tradeReject(marketNo, buyerId);
		
		// 3. marketNo completed = 1, completed_date = sysdate
		int result3 = marketDao.marketCompleted(marketNo);
		
		// 4. score_history_table에 포인트 기록 추가(
		Market m = marketDao.selectSellerId(marketNo);
		String sellerId = m.getMarketWriter();
		int result4 = marketDao.addPointHistory(marketNo, sellerId);
		
		// 5. member_tbl에 sellerId 포인트 증가
		int result5 = marketDao.addPointMember(sellerId);
		
		// 6. score_history_table에 buyer 포인트 기록 추가
		int result6 = marketDao.addPointHistory2(marketNo, buyerId);
		
		// 7. member_tbl에 buyerId 포인트 증가
		int result7 = marketDao.addPointMember2(buyerId);
		
		int result = result1 + result2 + result3 + result4;
		
		
		
		return result;
	}

	// 거래요청
	@Transactional
	public int tradeRequest(TradeRequest request) {
		int result = marketDao.tradeRequest(request);
		return result;
	}

	// 거래요청 취소
	@Transactional
	public int tradeRequestCancel(Integer marketNo, String token) {
		LoginMember loginMember = jwtUtil.checkToken(token);
		String buyerId = loginMember.getMemberId();
		int result = marketDao.tradeRequestCancel(marketNo, buyerId);
		return result;
	}

	// 마켓 삭제시 market_tbl 삭제,market_file_tbl 삭제
	@Transactional
	public Map<String, Object> deleteOneMarketAndFileTbl(Integer marketNo) {
		Map<String, Object> serviceResponse = new HashMap<String, Object>();
		int fileCount = marketDao.deleteFileTbl(marketNo);
		int result = marketDao.deleteOneMarket(marketNo);
		serviceResponse.put("fileCount", fileCount);
		serviceResponse.put("result", result);
		return serviceResponse;
	}

	// 신고 취소
	@Transactional
	public int cancelReport(Integer marketNo, String token) {
		LoginMember loginMember = jwtUtil.checkToken(token);
		String memberId = loginMember.getMemberId();
		int result = marketDao.cancelReport(marketNo, memberId);
		return result;
	}

	// 조회수 증가
	@Transactional
	public int incrementViewCount(Integer marketNo) {
		int result = marketDao.incrementViewCount(marketNo);
		return result;
	}

	// 신고 등록
	@Transactional
	public int pushReport(MarketReport marketReport) {
		int result = marketDao.pushReport(marketReport);
		return result;
	}

	// 탄소 기여도 출력
	public ListResponse selectOneCarbonContributionList(String memberId, ListItem request) {
		Integer totalCount = marketDao.selectOneCarbonContributionCount(memberId, request);
		int totalPage = (int) Math.ceil(totalCount / (double) request.getSize());
		List<ScoreHistory> list = marketDao.selectOneCarbonContributionList(memberId, request);
		ListResponse response = new ListResponse(list, totalPage);

		return response;
	}

}
