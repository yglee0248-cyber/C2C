package kr.co.iei.market.model.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor	
@Data
public class ListItem {
	private Integer page;
	private Integer size;
	private Integer status;			//거래공개여부
	private Integer order;			//정렬
	private Integer searchType;		//검색조건		
	private Integer location;		//거래장소
	private String searchKeyword;	//입력한정보
	private Integer view;			// 출력 조건
	private String memberId;
}