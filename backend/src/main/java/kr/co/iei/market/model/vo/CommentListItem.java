package kr.co.iei.market.model.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor	
@Data
public class CommentListItem {
    private int marketNo;
    private int page = 0;            	// 기본값 0
    private int size = 10;            	// 기본값 10개씩
    private String filterType = "all"; 	// 기본값 전체보기
    private String orderType = "newest";// 기본값 최신순
}