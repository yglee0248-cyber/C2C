package kr.co.iei.member.model.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor	
@Data
public class MemberListItem {
	private Integer page;
	private Integer size;
	private Integer order;		
	private Integer selectedGrade;
	private Integer searchType;		
	private String searchKeyword;	
}
