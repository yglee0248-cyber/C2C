package kr.co.iei.community.controller;

import java.util.List;
import java.util.Map;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import kr.co.iei.community.model.service.CommunityService;
import kr.co.iei.community.model.vo.Community;
import kr.co.iei.community.model.vo.CommunityComment;
import kr.co.iei.community.model.vo.CommunityCommentListItem;
import kr.co.iei.community.model.vo.CommunityCommentReport;
import kr.co.iei.community.model.vo.CommunityListItem;
import kr.co.iei.community.model.vo.CommunityListResponse;

@CrossOrigin(value = "*")
@RequestMapping(value = "/communities")
@RestController
public class CommunityController {
	@Autowired
	private CommunityService communityService;
	
	@GetMapping // 커뮤 게시글 목록
	public ResponseEntity<?> selectBoardList(@ModelAttribute CommunityListItem request) {
		CommunityListResponse response = communityService.selectCommunityList(request);
		return ResponseEntity.ok(response);
	}

	// 커뮤니티 글 조회수 변경
	@PatchMapping(value = "/view/{communityNo}")
	public ResponseEntity<?> updateViewCountCommunity(@PathVariable Integer communityNo) {
		int result = communityService.updateViewCountCommunity(communityNo);
		return ResponseEntity.ok(result);
	}

	@PostMapping // 커뮤 게시글 등록
	public ResponseEntity<?> insertCommunity(@ModelAttribute Community community) {
		Document doc = Jsoup.parse(community.getCommunityContent());
		int result = communityService.insertCommunity(community);
		return ResponseEntity.ok(result);
	}

	@GetMapping(value = "/{communityNo}") // 커뮤 게시글 상세보기
	public ResponseEntity<?> selectOneCommunity(@PathVariable Integer communityNo) {
		Community community = communityService.selectOneCommunity(communityNo);
		return ResponseEntity.ok(community);
	}
	
	
	@PutMapping(value="/{communityNo}") // 커뮤 게시글 수정하기
	public ResponseEntity<?> updateCommunity(@PathVariable Integer communityNo,
								@ModelAttribute Community community){
		community.setCommunityNo(communityNo);
		int result = communityService.updateCommunity(community);
		return ResponseEntity.ok(result);
	}

	// 메인 페이지용 리스트 조회 - 이영민
	@GetMapping(value = "/main")
	public ResponseEntity<?> selectMainPageCommunityList(@RequestParam String type, @RequestParam(required = false) String memberId) {
		// 저는 totalPage가 필요없어서 마켓 리스트 객체를 따로 만들게요 - 이영민
		List<Community> list = communityService.selectMainPageCommunityList(type, memberId);
		return ResponseEntity.ok(list);
	}
	
	// 1. 특정 게시글의 댓글 목록 조회 - 이영민
	@GetMapping(value = "/{communityNo}/comments") 
	public ResponseEntity<?> selectCommunityCommentList(@PathVariable Integer communityNo, @ModelAttribute CommunityCommentListItem item) {
		item.setCommunityNo(communityNo); // 경로 변수 세팅
		CommunityListResponse response = communityService.selectCommunityCommentList(item);
		return ResponseEntity.ok(response);
	}
	
	// 2. 댓글 작성 (대댓글 포함) - 이영민
	@PostMapping(value = "/comments") 
	public ResponseEntity<?> insertCommunityComment(@RequestBody CommunityComment communityComment) {
		int result = communityService.insertCommunityComment(communityComment);
		return ResponseEntity.ok(result);
	}

	// 3. 댓글 수정 - 이영민
	@PatchMapping(value = "/comments") 
	public ResponseEntity<?> updateCommunityComment(@RequestBody CommunityComment comment) {
		int result = communityService.updateCommunityComment(comment);
		return ResponseEntity.ok(result);
	}

	// 4. 댓글 삭제 - 이영민
	@DeleteMapping(value = "/comments/{communityCommentNo}") 
	public ResponseEntity<?> deleteCommunityComment(@PathVariable Integer communityCommentNo) {
		int result = communityService.deleteCommunityComment(communityCommentNo);
		return ResponseEntity.ok(result);
	}

	// 5. 댓글 좋아요 / 싫어요 정보 조회 - 이영민
	@GetMapping(value="/comments/{communityCommentNo}/likes")
	public ResponseEntity<?> selectCommentLikeInfo(@PathVariable Integer communityCommentNo, @RequestHeader(required = false,name="Authorization") String token){	// 로그인 안되어 있어도 정보를 불러올수있게 required = false
		Map<String,Object> result = communityService.selectCommentLikeInfo(communityCommentNo, token);
		return ResponseEntity.ok(result);
	}
	
	// 6. 댓글 좋아요 on - 이영민
	@PostMapping(value="/comments/{communityCommentNo}/likes")
	public ResponseEntity<?> commentLikeOn(@PathVariable Integer communityCommentNo, @RequestHeader(name="Authorization") String token){
		int result = communityService.commentLikeOn(communityCommentNo, token);
		return ResponseEntity.ok(result);
	}
	
	// 7. 댓글 좋아요 off - 이영민
	@DeleteMapping(value="/comments/{communityCommentNo}/likes")
	public ResponseEntity<?> commentLikeOff(@PathVariable Integer communityCommentNo, @RequestHeader(name="Authorization") String token){
		int result = communityService.commentLikeOff(communityCommentNo, token);
		return ResponseEntity.ok(result);
	}

	// 8. 댓글 싫어요 on - 이영민
	@PostMapping(value="/comments/{communityCommentNo}/dislikes")
	public ResponseEntity<?> commentDislikeOn(@PathVariable Integer communityCommentNo, @RequestHeader(name="Authorization") String token){
		int result = communityService.commentDislikeOn(communityCommentNo, token);
		return ResponseEntity.ok(result);
	}
	
	// 9. 댓글 싫어요 off - 이영민
	@DeleteMapping(value="/comments/{communityCommentNo}/dislikes")
	public ResponseEntity<?> commentDislikeOff(@PathVariable Integer communityCommentNo, @RequestHeader(name="Authorization") String token){
		int result = communityService.commentDislikeOff(communityCommentNo, token);
		return ResponseEntity.ok(result);
	}

	// 10. 댓글 신고 - 이영민
	@PostMapping(value="/comments/reports")
	public ResponseEntity<?> insertCommentReport(@RequestBody CommunityCommentReport report){
		int result = communityService.insertCommentReport(report);
		return ResponseEntity.ok(result);
	}

	@DeleteMapping(value = "/{communityNo}") // 커뮤 게시글 삭제하기
	public ResponseEntity<?> deleteCommunity(@PathVariable Integer communityNo) {
		int result = communityService.deleteCommunity(communityNo);
		return ResponseEntity.ok(result);
	}


	@GetMapping(value = "/{communityNo}/likes") // 커뮤 좋아요 출력
	public ResponseEntity<?> selectLikeInfo(@PathVariable Integer communityNo,
			@RequestHeader(required = false, name = "Authorization") String token) {
		Map<String, Object> result = communityService.selectLikeInfo(communityNo, token);
		return ResponseEntity.ok(result);
	}

	@PostMapping(value = "/{communityNo}/likes") // 커뮤 좋아요 클릭
	public ResponseEntity<?> likeOn(@PathVariable Integer communityNo,
			@RequestHeader(name = "Authorization") String token) {
		int result = communityService.insertLike(communityNo, token);
		return ResponseEntity.ok(result);
	}

	@DeleteMapping(value = "/{communityNo}/likes") // 커뮤 좋아요 해제(된 상태)
	public ResponseEntity<?> likeOff(@PathVariable Integer communityNo,
			@RequestHeader(name = "Authorization") String token) {
		int result = communityService.deleteLike(communityNo, token);
		return ResponseEntity.ok(result);
	}

	@GetMapping(value = "/{communityNo}/dislikes") // 커뮤 싫어요 출력
	public ResponseEntity<?> selectDislikeInfo(@PathVariable Integer communityNo,
			@RequestHeader(required = false, name = "Authorization") String token) {
		Map<String, Object> result = communityService.selectDislikeInfo(communityNo, token);
		return ResponseEntity.ok(result);
	}

	@PostMapping(value = "/{communityNo}/dislikes") // 커뮤 싫어요 클릭
	public ResponseEntity<?> dislikeOn(@PathVariable Integer communityNo,
			@RequestHeader(name = "Authorization") String token) {
		int result = communityService.insertDislike(communityNo, token);
		return ResponseEntity.ok(result);
	}

	@DeleteMapping(value = "/{communityNo}/dislikes") // 커뮤 싫어요 해제(된 상태)
	public ResponseEntity<?> dislikeOff(@PathVariable Integer communityNo,
			@RequestHeader(name = "Authorization") String token) {
		int result = communityService.deleteDislike(communityNo, token);
		return ResponseEntity.ok(result);
	}

	@GetMapping(value = "/{communityNo}/reports") // 커뮤 게시판 신고 출력
	public ResponseEntity<?> selectReportInfo(@PathVariable Integer communityNo,
			@RequestHeader(required = false, name = "Authorization") String token) {
		Map<String, Object> reportInfo = communityService.selectReportInfo(communityNo, token);
		return ResponseEntity.ok(reportInfo);
	}

	@PostMapping(value = "/{communityNo}/reports") // 커뮤 게시판 신고 클릭
	public ResponseEntity<?> reportOn(@PathVariable Integer communityNo,
			@RequestHeader(name = "Authorization") String token,
				@RequestBody Map<String, String> body) {
		 String reportReason = body.get("reportReason");
		int result = communityService.insertReport(communityNo, token, reportReason);
		return ResponseEntity.ok(result);
	}

	@DeleteMapping(value = "/{communityNo}/reports") // 커뮤 게시판 신고 해제(된 상태)
	public ResponseEntity<?> deleteReport(@PathVariable Integer communityNo,
			@RequestHeader(name = "Authorization") String token) {
		int result = communityService.deleteReport(communityNo, token);
		return ResponseEntity.ok(result);
	}
}
