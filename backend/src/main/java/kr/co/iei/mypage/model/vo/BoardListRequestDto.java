package kr.co.iei.mypage.model.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class BoardListRequestDto {
	
	private Boolean isAdminMode;
	private Integer page;
	private Integer size;
	private Integer order;
	private Integer status;
	private String searchKeyword;
	private String memberId;
	private Integer memberGrade;	
	
	private Integer completed;
	private Integer notice;
}

