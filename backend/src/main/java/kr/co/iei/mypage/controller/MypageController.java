package kr.co.iei.mypage.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import kr.co.iei.mypage.model.service.MypageService;
import kr.co.iei.mypage.model.vo.BoardListRequestDto;
import kr.co.iei.mypage.model.vo.BoardListResponseDto;
import kr.co.iei.mypage.model.vo.BoardSummary;
import kr.co.iei.mypage.model.vo.ChartResDto;
import kr.co.iei.mypage.model.vo.Color;
import kr.co.iei.mypage.model.vo.CommentListResponseDto;
import kr.co.iei.mypage.model.vo.CommentSummary;
import kr.co.iei.mypage.model.vo.MemberColor;
import kr.co.iei.mypage.model.vo.MyPost;
import kr.co.iei.mypage.model.vo.ReportRequestDto;
import kr.co.iei.mypage.model.vo.ReportResponseDto;
import kr.co.iei.mypage.model.vo.TodayStats;
import kr.co.iei.mypage.model.vo.TradeStatusReqDto;
import kr.co.iei.mypage.model.vo.TradeStatusResDto;
import kr.co.iei.mypage.model.vo.UpdateCommentDto;
import kr.co.iei.mypage.model.vo.UpdateDto;

@CrossOrigin(value = "*")
@RequestMapping(value = "/mypages")
@RestController
public class MypageController {

	@Autowired
	private MypageService mypageService;

	// 커뮤 게시글 get
	@GetMapping("/board/community")
	public ResponseEntity<?> findCommunityAll(@ModelAttribute BoardListRequestDto request) {
		List<BoardSummary> list = mypageService.findCommunityAll(request);

		int count = mypageService.findCommunityCount(request);
		int totalPage = (int) Math.ceil(count / (double) request.getSize()); 
				
		BoardListResponseDto response = new BoardListResponseDto(list, totalPage); 
		
		return ResponseEntity.ok(response);
	}//
	
	// 커뮤 게시글 숨김여부 업데이트
	@PatchMapping("/board/community/{boardNo}")
	public ResponseEntity<?> updateCommunityStatus(@RequestBody UpdateDto update){
		int result = mypageService.updateCommunityStatus(update);
		
		return ResponseEntity.ok(result);
	}//
	
	// 커뮤 게시글 삭제
	@DeleteMapping("/board/community/{boardNo}")
	public ResponseEntity<?> deleteCommunity(@PathVariable int boardNo){
		int result = mypageService.deleteCommunity(boardNo);
		
		return ResponseEntity.ok(result);
	}//
	
	// 거래 게시글 get
	@GetMapping("/board/market")
	public ResponseEntity<?> findMarketAll(@ModelAttribute BoardListRequestDto request){
		List<BoardSummary> list = mypageService.findMarketAll(request);
		
		int count = mypageService.findMarketAllCount(request);
		int totalPage = (int) Math.ceil(count / (double) request.getSize());
		
		BoardListResponseDto response = new BoardListResponseDto(list, totalPage);
		
		return ResponseEntity.ok(response);
	}//
	
	// 거래 게시글 숨김 상태 update
	@PatchMapping("/board/market/{boardNo}")
	public ResponseEntity<?> updateMarketStatus(@RequestBody UpdateDto update){
		int result = mypageService.updateMarketStatus(update);
		
		return ResponseEntity.ok(result);
	}//
	
	// 거래 게시글 삭제 
	@DeleteMapping("/board/market/{boardNo}")
	public ResponseEntity<?> deleteMarket(@PathVariable int boardNo){
		int result = mypageService.deleteMarket(boardNo);
		
		return ResponseEntity.ok(result);
	}//

	// 거래 게시글 댓글 get
	@GetMapping("/comment/market")
	public ResponseEntity<?> findMarketCommentAll(@ModelAttribute BoardListRequestDto request){
		List<CommentSummary> list = mypageService.findMarketCommentAll(request);
		
		int count = mypageService.findMarketCommentAllCount(request);
		int totalPage = (int) Math.ceil(count / (double) request.getSize());
		
		CommentListResponseDto response = new CommentListResponseDto(list, totalPage);
		
		return ResponseEntity.ok(response); 
	}//
	
	// 댓글 수정
	@PatchMapping("/comment/{commentNo}")
	public ResponseEntity<?> updateComment(@RequestBody UpdateCommentDto update){
		int result = mypageService.updateComment(update); 
		
		return ResponseEntity.ok(result);
	}//
	
	// 댓글 삭제
	@DeleteMapping("/comment/{commentNo}")
	public ResponseEntity<?> deleteComment(@RequestBody UpdateCommentDto delete){
		int result = mypageService.deleteComment(delete);
		
		return ResponseEntity.ok(result);
	}//
	
	// 커뮤 댓글 get
	@GetMapping("/comment/community")
	public ResponseEntity<?> findCommunityCommentAll(@ModelAttribute BoardListRequestDto request){
		List<CommentSummary> list = mypageService.findCommunityCommentAll(request);
		
		int count = mypageService.findCommunityCommentAllCount(request);
		int totalPage = (int) Math.ceil(count / (double) request.getSize());
		
		CommentListResponseDto response = new CommentListResponseDto(list, totalPage);
				
		return ResponseEntity.ok(response);
	}//
	
	@GetMapping("/report/{boardNo}")
	public ResponseEntity<?> findReportAll(@ModelAttribute ReportRequestDto request){
		List<ReportResponseDto> list = mypageService.findReportAll(request);
		
		return ResponseEntity.ok(list);
	}//
	
	@GetMapping("/report/private/{boardNo}")
	public ResponseEntity<?> findPrivateReport(@ModelAttribute ReportRequestDto request){
		ReportResponseDto privateReport = mypageService.findPrivateReport(request);
		
		return ResponseEntity.ok(privateReport);
	}//
	
	// 좋아요/싫어요/신고 게시글 get
	@GetMapping("/board/likedislike")
	public ResponseEntity<?> findLikeDislikeAll(@ModelAttribute BoardListRequestDto request){
		List<BoardSummary> list = mypageService.findLikeDislikeAll(request);
		
		int count = mypageService.findLikeDislikeCount(request);
		int totalPage = (int) Math.ceil(count / (double) request.getSize());
		
		BoardListResponseDto response = new BoardListResponseDto(list, totalPage);
		
		return ResponseEntity.ok(response);
	}//
	

	@GetMapping("/tradestatus/chart")
	public ResponseEntity<?> findChartAll(@ModelAttribute TradeStatusReqDto request){
		List<ChartResDto> chart = mypageService.findChartAll(request);
		
		return ResponseEntity.ok(chart);
	}//
	
	@GetMapping("/tradestatus/list")
	public ResponseEntity<?> findListAll(@ModelAttribute TradeStatusReqDto request){
		List<TradeStatusResDto> list = mypageService.findListAll(request);
		
		int count = mypageService.findListAllCount(request);
		int totalPage = (int) Math.ceil(count / (double) request.getSize());
		
		Map<String, Object> map = new HashMap<>();
		map.put("list", list);
		map.put("totalPage", totalPage);
		
		return ResponseEntity.ok(map);
	}//
	
	// 차트용
	@GetMapping(value = "/today/{memberId}")
	public ResponseEntity<?> todayOneCounts(@PathVariable String memberId){
		List<TodayStats> list = mypageService.todayOneCounts(memberId);
		
		return ResponseEntity.ok(list);
	}
	
	// 나의 인기글
	@GetMapping(value= "/my-best/{memberId}")
	public ResponseEntity<?> myBestPost(@PathVariable String memberId){
		List<MyPost> list = mypageService.myBestPost(memberId);
		
		return ResponseEntity.ok(list);
	}
	
	// 나의 최신글
	@GetMapping(value= "/my-recent/{memberId}")
	public ResponseEntity<?> myRecentPost(@PathVariable String memberId){
		List<MyPost> list = mypageService.myRecentPost(memberId);
		
		return ResponseEntity.ok(list);
	}
	
	@GetMapping(value= "/color")
	public ResponseEntity<?> selectColorList(){
		List<Color> list = mypageService.selectColorList();
		
		return ResponseEntity.ok(list);
	}
	
	@PatchMapping("/color")
	public ResponseEntity<?> updateCurrentColor(@RequestBody MemberColor memberColor){
		int result = mypageService.updateCurrentColor(memberColor);
		
		return ResponseEntity.ok(result);
	}//
}













