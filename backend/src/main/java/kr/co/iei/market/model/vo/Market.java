package kr.co.iei.market.model.vo;

import java.util.List;

import org.apache.ibatis.type.Alias;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Alias(value="market")
public class Market {
	private Integer marketNo;		//번호
	private String marketTitle;		//제목
	private String marketContent;	//내용
	private String marketDate;		//작성일
	private Integer marketStatus;	//거래상태 (1:공개 2:비공개)
	private String marketWriter;	//작성자
	private Integer viewCount;		//조회수
	private String sellAddr;		//판매장소
	private Integer sellPrice;		//판매금액
	private Integer completed;		//완료	(0:미완료 1:완료)
	private String completedDate;	//거래완료시간
	private String marketThumb;		//썸네일 파일로 market_file_tbl 에서 서브쿼리로 가져옴
	private String memberThumb;		//멤버 썸네일 파일 member_tbl 에서 조인으로 가져옴
	private Integer likeCount;		//좋아요 수
	private Integer isLike;			//좋아요 여부
	private Integer reportCount;	//신고 수
	private Integer isReport;		//신고 여부
	private Integer isRequest;		//거래 요청여부
	private Integer commentCount;	//댓글수 market_comment_tbl 에서 서브쿼리로 가져옴
	private List<MarketFile> fileList;
	private List<String> deleteFilePath;
	private String hexCode;
	private String memberName;
	
}
