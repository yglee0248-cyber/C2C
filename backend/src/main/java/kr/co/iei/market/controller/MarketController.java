package kr.co.iei.market.controller;

import java.io.File;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
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
import org.springframework.web.multipart.MultipartFile;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import kr.co.iei.market.model.dto.MarketCreateResponse;
import kr.co.iei.market.model.dto.MarketResponse;
import kr.co.iei.market.model.dto.MarketUpdateResponse;
import kr.co.iei.market.model.service.MarketService;
import kr.co.iei.market.model.vo.CommentListItem;
import kr.co.iei.market.model.vo.ListItem;
import kr.co.iei.market.model.vo.ListResponse;
import kr.co.iei.market.model.vo.Market;
import kr.co.iei.market.model.vo.MarketComment;
import kr.co.iei.market.model.vo.MarketCommentReport;
import kr.co.iei.market.model.vo.MarketReport;
import kr.co.iei.market.model.vo.TradeRequest;

@CrossOrigin(
	    origins = {
	        "http://192.168.31.24:5173"
	    },
	    allowCredentials = "true"
	)
@RestController
@RequestMapping(value = "/markets")

public class MarketController {
	@Autowired
	private MarketService marketService;
	@Value("${file.root}")
	private String root;
	
	 // 마켓게시판 거래 성사시 지급될 포인트

	// 메인 페이지용 5개 리스트 조회 - 이영민
	@GetMapping("/main")
	public ResponseEntity<?> selectMainPageMarketList(@RequestParam Map<String, Object> params) {
		// 저는 totalPage가 필요없어서 마켓 리스트 객체를 따로 만들게요 - 이영민
		List<Market> list = marketService.selectMainPageMarketList(params);
		return ResponseEntity.ok(list);
	}

	// 1. 특정 게시글의 댓글 목록 조회 - 이영민
	@GetMapping(value = "/{marketNo}/comments")
	public ResponseEntity<?> selectMarketCommentList(@PathVariable Integer marketNo,
			@ModelAttribute CommentListItem item) {
		item.setMarketNo(marketNo);
		ListResponse response = marketService.selectMarketCommentList(item);
		return ResponseEntity.ok(response);
	}

	// 2. 댓글 작성 (대댓글 포함) - 이영민
	@PostMapping(value = "/comments")
	public ResponseEntity<?> insertMarketComment(@RequestBody MarketComment marketComment) {
		int result = marketService.insertMarketComment(marketComment);
		return ResponseEntity.ok(result);
	}

	// 3. 댓글 삭제 - 이영민
	@DeleteMapping(value = "/comments/{commentNo}")
	public ResponseEntity<?> deleteMarketComment(@PathVariable Integer commentNo) {
		int result = marketService.deleteMarketComment(commentNo);
		return ResponseEntity.ok(result);
	}

	// 4. 댓글 수정 - 이영민
	@PatchMapping(value = "/comments")
	public ResponseEntity<?> updateMarketComment(@RequestBody MarketComment marketComment) {
		int result = marketService.updateMarketComment(marketComment);
		return ResponseEntity.ok(result);
	}

	// 5. 댓글 신고 - 이영민
	@PostMapping(value = "/comments/reports")
	public ResponseEntity<?> insertMarketCommentReport(@RequestBody MarketCommentReport report) {
		int result = marketService.insertMarketCommentReport(report);
		return ResponseEntity.ok(result);
	}

	
	/// 마켓게시판 등록 (Markets) Create : 한진호
	@PostMapping	// 매핑 : /markets
	public ResponseEntity<MarketResponse<MarketCreateResponse>> insertMarket(
			@RequestHeader(required = false, name = "Authorization") String token,
			@ModelAttribute Market market,
			@RequestParam List<MultipartFile> files) {
		MarketResponse<MarketCreateResponse> result = marketService.insertMarket(token, market, files);
		return ResponseEntity.ok(result);
	}
 
	/// 마켓게시판 조회 (Markets) Read_list : 한진호
	@GetMapping		// 매핑 : /markets
	public ResponseEntity<?> selectMarketList(
			@RequestHeader(required = false, name = "Authorization") String token,
			@ModelAttribute ListItem request) {
		//System.out.println("토큰 : "+token);
		//System.out.println(request);
		ListResponse response = marketService.selectMarketList(request,token);
		return ResponseEntity.ok(response);
	}

	/// 마켓게시판 조회 (Markets/{marketNo}) Read_vo
	@GetMapping(value = "/{marketNo:\\d+}")
	public ResponseEntity<MarketResponse<Market>> selectOneMarket(
			@RequestHeader(required = false, name = "Authorization") String token,
			@PathVariable Integer marketNo,
			HttpServletRequest request,
			HttpServletResponse response) {
		
		MarketResponse<Market> result = marketService.selectOneMarket(token,marketNo,request,response);
		
		return ResponseEntity.ok(result);

	}
	/// 마켓게시판 수정 (Markets/{marketNo}) Update : 한진호
	@PutMapping(value="/{marketNo}")
	public ResponseEntity<MarketResponse<MarketUpdateResponse>> updateOneMarket(
			@RequestHeader(required = false, name = "Authorization") String token,
			@ModelAttribute Market market,
			@RequestParam(value = "files", required = false	) List<MultipartFile> files,
			@PathVariable Integer marketNo){
		MarketResponse<MarketUpdateResponse> result = marketService.updateOneMarket(token,market,files,marketNo);
		return ResponseEntity.ok(result);
	}
	
	/// 마켓게시판 삭제 (Markets/{marketNo}) Delete : 한진호
	@DeleteMapping(value = "/{marketNo}")
	public ResponseEntity<?> deleteOneMarket(@PathVariable Integer marketNo) {
		// 1. 파일패스 가져오기
		List<String> fileList = marketService.getFilePath(marketNo);

		// 2.서비스 처리 (market_file_tbl 삭제, market_tbl 삭제)
		Map<String, Object> serviceResponse = new HashMap<String, Object>();
		serviceResponse = marketService.deleteOneMarketAndFileTbl(marketNo);
		int fileCount = (int) serviceResponse.get("fileCount");
		int result = (int) serviceResponse.get("result");
		//System.out.println("\n 파일TBL 삭제 결과 (1~10) : " + fileCount);
		//System.out.println("마켓TBL 삭제 결과 (0~1) : " + result);

		// 3. 파일 삭제
		String savepath = root + "market/";
		boolean allDeleted = true;
		if (result == 1) {
			if (fileList != null && !fileList.isEmpty()) {
				for (String fileName : fileList) {
					boolean bool = deleteFile(fileName, savepath);
					if (!bool) {
						allDeleted = false;
					}
				}
			}
		}
		//System.out.println("전체파일 삭제결과 : " + allDeleted);

		Map<String, Object> response = new HashMap<String, Object>();
		response.put("fileCount", fileCount); // 프론트에 전달할 삭제파일 갯수
		response.put("allDeleted", allDeleted); // 프론트에 전달할 전체 삭제 정상 여부
		response.put("result", result); // 프론트에 전달할 게시물 삭제 여부
		return ResponseEntity.ok(response);
	}

	// FileUtils 로 이동완료 추후 삭제
	private boolean deleteFile(String filename, String root) {
		if (filename == null || filename.isEmpty())
			return false;
		File file = new File(root + filename);
		if (file.exists()) {
			return file.delete(); // 파일 삭제 성공시 true 리턴
		}
		return false;
	}

	/// 마켓게시판-좋아요-등록 (Markets/{marketNo}/likes) Create : 한진호
	@PostMapping(value = "/{marketNo}/likes")
	public ResponseEntity<?> likeOn(@PathVariable Integer marketNo,
			@RequestHeader(name = "Authorization") String token) {
		int result = marketService.likeOn(marketNo, token);
		return ResponseEntity.ok(result);
	}

	/// 마켓게시판-좋아요-삭제 (Markets/{marketNo}/likes) Delete : 한진호
	@DeleteMapping(value = "/{marketNo}/likes")
	public ResponseEntity<?> likeOff(@PathVariable Integer marketNo,
			@RequestHeader(name = "Authorization") String token) {
		int result = marketService.likeOff(marketNo, token);
		return ResponseEntity.ok(result);
	}

	/// 마켓게시판-신고-등록 (Markets/{marketNo}/reports) Create : 한진호
	@PostMapping(value = "/{marketNo}/reports")
	public ResponseEntity<?> pushReport(@RequestBody MarketReport marketReport) {
		int result = marketService.pushReport(marketReport);
		return ResponseEntity.ok(result);
	}

	/// 마켓게시판-신고-삭제 (Markets/{marketNo}/reports) Delete : 한진호
	@DeleteMapping(value = "/{marketNo}/reports")
	public ResponseEntity<?> cancelReport(@PathVariable Integer marketNo,
			@RequestHeader(name = "Authorization") String token) {
		int result = marketService.cancelReport(marketNo, token);
		return ResponseEntity.ok(result);
	}

	/// 마켓게시판-거래요청-등록 (Markets/{marketNo}/requests) Create : 한진호
	@PostMapping(value = "/{marketNo}/request")
	public ResponseEntity<?> tradeRequest(@RequestBody TradeRequest request) {
		int result = marketService.tradeRequest(request);
		return ResponseEntity.ok(result);
	}

	/// 마켓게시판-거래요청-조회 (Markets/{marketNo}/requests) Read_list : 한진호
	@GetMapping(value = "/{marketNo}/requests")
	public ResponseEntity<?> selectAllTradeRequest(@PathVariable Integer marketNo) {
		// System.out.println("글번호확인 : " + marketNo);
		List<TradeRequest> list = marketService.selectAllTradeRequest(marketNo);
		// System.out.println(list);
		return ResponseEntity.ok(list);
	}

	/// 마켓게시판-거래요청-수정 (Markets/{marketNo}/requests/{BuyerId}) Update : 한진호
	// 거래확정
	@PatchMapping(value = "/{marketNo}/requests/{buyerId}")
	public ResponseEntity<?> tradeComplete(@PathVariable Integer marketNo, @PathVariable String buyerId) {
		int result = marketService.tradeComplete(marketNo, buyerId);
		return ResponseEntity.ok(result);
	}

	/// 마켓게시판-거래요청-삭제 (Markets/{marketNo}/requests}) Delete : 한진호
	@DeleteMapping(value = "{marketNo}/request")
	public ResponseEntity<?> tradeRequestCancel(@PathVariable Integer marketNo,
			@RequestHeader(name = "Authorization") String token) {
		int result = marketService.tradeRequestCancel(marketNo, token);
		return ResponseEntity.ok(result);
	}

	// 멤버 개인 탄소 기여도
	@GetMapping(value = "/carbon-contribution/{memberId}")
	public ResponseEntity<?> carbonContribution(@PathVariable String memberId, @ModelAttribute ListItem request) {
		ListResponse response = marketService.selectOneCarbonContributionList(memberId, request);
		return ResponseEntity.ok(response);
	}
}
