package kr.co.iei.community.model.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import kr.co.iei.community.model.dao.CommunityDao;
import kr.co.iei.community.model.vo.Community;
import kr.co.iei.community.model.vo.CommunityListItem;
import kr.co.iei.community.model.vo.CommunityListResponse;
import kr.co.iei.community.model.vo.CommunityComment;
import kr.co.iei.community.model.vo.CommunityCommentListItem;
import kr.co.iei.community.model.vo.CommunityCommentReport;
import kr.co.iei.member.model.vo.LoginMember;
import kr.co.iei.utils.JwtUtils;

@Service
public class CommunityService {

	@Autowired
	private CommunityDao communityDao;

	@Autowired
	private JwtUtils jwtUtil;

	public CommunityListResponse selectCommunityList(CommunityListItem request) {
		Integer totalCount = communityDao.selectCommunityCount(request);
		int totalPage = (int) Math.ceil(totalCount / (double) request.getSize());

		List<Community> list = communityDao.selectCommunityList(request);
		CommunityListResponse response = new CommunityListResponse(list, totalPage);
		return response;
	}
	
	@Transactional // 커뮤 글 등록
	public int insertCommunity(Community community) {
		int result = communityDao.insertCommunity(community);
		return result;
	}
	
	// 커뮤 상세 보기 (특정 게시글)
	public Community selectOneCommunity(int communityNo) {
		Community community = communityDao.selectOneCommunity(communityNo);
		return community;
	}
	
	@Transactional // 커뮤 게시글 수정
	public int updateCommunity(Community community) {
		int result = communityDao.updateCommunity(community);
		return result;
	}
	
	@Transactional // 커뮤 게시글 삭제
	public int deleteCommunity(Integer communityNo) {
		int result = communityDao.deleteCommunity(communityNo);
		return result;
	}


	// 좋아요 표시
	public Map<String, Object> selectLikeInfo(Integer communityNo, String token) {
		int likeCount = communityDao.selectLikeCount(communityNo);
		Map<String, Object> likeInfo = new HashMap<String,Object>();
		likeInfo.put("likeCount", likeCount);
		if(token != null) {
			LoginMember loginMember = jwtUtil.checkToken(token);
			String memberId = loginMember.getMemberId();
			Map<String, Object> params = new HashMap<String,Object>();
			params.put("communityNo", communityNo);
			params.put("memberId", memberId);
			int isLike = communityDao.selectIsLike(params);
			likeInfo.put("isLike", isLike);
		}else {
			likeInfo.put("isLike", 0);
		}
		return likeInfo;
	}

	// 좋아요 클릭
	@Transactional
	public int insertLike(Integer communityNo, String token) {
		LoginMember login = jwtUtil.checkToken(token);
		Map<String, Object> map = new HashMap<String,Object>();
		map.put("communityNo", communityNo);
		map.put("memberId", login.getMemberId());
		communityDao.deleteDislike(map);
		int result = communityDao.insertLike(map);
		return result;
	}

	// 좋아요 해제
	@Transactional
	public int deleteLike(Integer communityNo, String token) {
		LoginMember login = jwtUtil.checkToken(token);
		Map<String, Object> map = new HashMap<String, Object>();
		map.put("communityNo", communityNo);
		map.put("memberId", login.getMemberId());
		int result = communityDao.deleteLike(map);
		return result;
	}

	// 싫어요 표시
	public Map<String, Object> selectDislikeInfo(Integer communityNo, String token) {
		int dislikeCount = communityDao.selectDislikeCount(communityNo);
		Map<String, Object> dislikeInfo = new HashMap<String,Object>();
		dislikeInfo.put("dislikeCount", dislikeCount);
		if(token != null) {
			LoginMember loginMember = jwtUtil.checkToken(token);
			String memberId = loginMember.getMemberId();
			Map<String, Object> params = new HashMap<String,Object>();
			params.put("communityNo", communityNo);
			params.put("memberId", memberId);
			int isDislike = communityDao.selectIsDislike(params);
			dislikeInfo.put("isDislike", isDislike);
		}else {
			dislikeInfo.put("isDislike", 0);
		}
		return dislikeInfo;
	}

	public int insertDislike(Integer communityNo, String token) {
		LoginMember login = jwtUtil.checkToken(token);
		Map<String, Object> map = new HashMap<String, Object>();
		map.put("communityNo", communityNo);
		map.put("memberId", login.getMemberId());
		communityDao.deleteLike(map);
		int result = communityDao.insertDislike(map);
		return result;
	}

	@Transactional // 싫어요 해제
	public int deleteDislike(Integer communityNo, String token) {
		LoginMember login = jwtUtil.checkToken(token);
		Map<String, Object> map = new HashMap<String, Object>();
		map.put("communityNo", communityNo);
		map.put("memberId", login.getMemberId());
		int result = communityDao.deleteDislike(map);
		return result;
	}

	// 신고 버튼 출력
	public Map<String, Object> selectReportInfo(Integer communityNo, String token) {
		int reportCount = communityDao.selectReportCount(communityNo);
		Map<String, Object> reportInfo = new HashMap<String,Object>();
		reportInfo.put("reportCount", reportCount);
		if(token != null) {
			LoginMember loginMember = jwtUtil.checkToken(token);
			String memberId = loginMember.getMemberId();
			Map<String, Object> params = new HashMap<String,Object>();
			params.put("communityNo", communityNo);
			params.put("memberId", memberId);
			int isReport = communityDao.selectIsReport(params);
			reportInfo.put("isReport", isReport);
		}else {
			reportInfo.put("isReport", 0);
		}
		return reportInfo;
	}
	
	@Transactional // 신고 클릭
	public int insertReport(Integer communityNo, String token, String reportReason) {
		LoginMember login = jwtUtil.checkToken(token);
		
		Map<String, Object> params = new HashMap<String,Object>();
		
		params.put("communityNo", communityNo);
		params.put("memberId", login.getMemberId());
		params.put("reportReason", reportReason);
		
		int result = communityDao.insertReport(params);
		return result;
	}

	@Transactional // 신고 해제
	public int deleteReport(Integer communityNo, String token) {
		LoginMember login = jwtUtil.checkToken(token);
		Map<String, Object> params = new HashMap<String,Object>();
		params.put("communityNo", communityNo);
		params.put("memberId", login.getMemberId());
		int result = communityDao.deleteReport(params);
		return result;
	}

	public int updateViewCountCommunity(Integer communityNo) {
		Community community = selectOneCommunity(communityNo);
		int result = communityDao.updateViewCountCommunity(community);
		return result;
	}
	
	// 메인페이지
	public List<Community> selectMainPageCommunityList(String type, String memberId) {
		Map<String, Object> map = new HashMap<>();
	    map.put("type", type);
	    map.put("memberId", memberId);
		List<Community> list = communityDao.selectMainPageCommunityList(map);
		return list;
	}
	
	// 댓글 조회
	public CommunityListResponse selectCommunityCommentList(CommunityCommentListItem item) {
		int totalCount = communityDao.selectParentCommentCount(item); // 총 부모 댓글 수 구하기 (자식 답글은 페이지 계산에서 제외)
		int totalPage = (int) Math.ceil(totalCount / (double) item.getSize()); // 총 페이지 수 계산
		
		List<CommunityComment> list = communityDao.selectCommunityCommentList(item); // 조회
		
		CommunityListResponse response = new CommunityListResponse(list, totalPage);
		return response;
	}
	
	// 댓글 작성
	@Transactional
	public int insertCommunityComment(CommunityComment communityComment) {
		int result = communityDao.insertCommunityComment(communityComment); // 작성
		return result;
	}

	// 댓글 수정
	@Transactional
	public int updateCommunityComment(CommunityComment comment) {
		int result = communityDao.updateCommunityComment(comment); // 수정
		return result;
	}

	// 댓글 삭제
	@Transactional
	public int deleteCommunityComment(Integer communityCommentNo) {
		int result = communityDao.deleteCommunityComment(communityCommentNo); // 삭제
		return result;
	}

	// 댓글 좋아요 / 싫어요 정보 조회
	public Map<String, Object> selectCommentLikeInfo(Integer communityCommentNo, String token) {
		int likeCount = communityDao.selectCommentLikeCount(communityCommentNo); // 댓글 좋아요수
		int dislikeCount = communityDao.selectCommentDislikeCount(communityCommentNo); // 댓글 싫어요수
		
		Map<String, Object> result = new HashMap<>(); // 컨트롤러에 줄 객체 생성해서 여기에 다 담기
		result.put("likeCount", likeCount);
		result.put("dislikeCount", dislikeCount);
		
		if (token != null) { // 토큰이 있다면 (로그인한 회원이라면)
			LoginMember loginMember = jwtUtil.checkToken(token); // 토큰 해독해서 유저 정보 꺼냄
			
			Map<String, Object> params = new HashMap<>(); // 로그인 유저 정보 담는 객체
			params.put("communityCommentNo", communityCommentNo);
			params.put("memberId", loginMember.getMemberId());
			
			result.put("isLike", communityDao.selectCommentIsLike(params)); // 로그인 유저가 좋아요를 누른적있는지 확인 (있으면 1, 없으면 0)
			result.put("isDislike", communityDao.selectCommentIsDislike(params)); // 로그인 유저가 싫어요를 누른적있는지 확인 (있으면 1, 없으면 0)
		} else { // 토큰이 없음 (로그인 x)
			// 위에서 없으면 0이라고 했으니 0
			result.put("isLike", 0); 
			result.put("isDislike", 0);
		}
		return result;
	}

	// 댓글 좋아요 on
	@Transactional
	public int commentLikeOn(Integer communityCommentNo, String token) {
		LoginMember loginMember = jwtUtil.checkToken(token); // 토큰 해독해서 유저 정보 꺼냄
		
		Map<String, Object> params = new HashMap<>(); // 로그인 유저 정보 담는 객체
		params.put("communityCommentNo", communityCommentNo);
		params.put("memberId", loginMember.getMemberId());
		
		communityDao.commentDislikeOff(params); // 싫어요가 있었다면 해제(사실 없어도 함수는 돌아가니 작동은 함)
		
		int result = communityDao.commentLikeOn(params);
		return result;
	}

	// 댓글 좋아요 off
	@Transactional
	public int commentLikeOff(Integer communityCommentNo, String token) {
		LoginMember loginMember = jwtUtil.checkToken(token); // 토큰 해독해서 유저 정보 꺼냄
		
		Map<String, Object> params = new HashMap<>(); // 로그인 유저 정보 담는 객체
		params.put("communityCommentNo", communityCommentNo);
		params.put("memberId", loginMember.getMemberId());
		
		int result = communityDao.commentLikeOff(params);
		return result;
	}

	// 댓글 싫어요 on
	@Transactional
	public int commentDislikeOn(Integer communityCommentNo, String token) {
		LoginMember loginMember = jwtUtil.checkToken(token); // 토큰 해독해서 유저 정보 꺼냄
		
		Map<String, Object> params = new HashMap<>(); // 로그인 유저 정보 담는 객체
		params.put("communityCommentNo", communityCommentNo);
		params.put("memberId", loginMember.getMemberId());
		
		communityDao.commentLikeOff(params); // 좋아요가 있었다면 해제(사실 없어도 함수는 돌아가니 작동은 함)
		
		int result = communityDao.commentDislikeOn(params);
		return result;
	}

	// 댓글 싫어요 off
	@Transactional
	public int commentDislikeOff(Integer communityCommentNo, String token) {
		LoginMember loginMember = jwtUtil.checkToken(token); // 토큰 해독해서 유저 정보 꺼냄
		
		Map<String, Object> params = new HashMap<>(); // 로그인 유저 정보 담는 객체
		params.put("communityCommentNo", communityCommentNo);
		params.put("memberId", loginMember.getMemberId());
		
		int result = communityDao.commentDislikeOff(params);
		return result;
	}

	// 댓글 신고
	@Transactional
	public int insertCommentReport(CommunityCommentReport report) {
		int result = communityDao.insertCommentReport(report);
		return result;
	}


}
