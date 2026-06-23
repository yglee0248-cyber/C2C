package kr.co.iei.community.model.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class CommunityListItem {
	private Integer page;
	private Integer size;
	private Integer status;
	private Integer order;
	private Integer searchType;
	private String searchKeyword;
	private Integer view;
	private String memberId;
	
	private Integer grade;
}
