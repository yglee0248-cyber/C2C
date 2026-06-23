package kr.co.iei.mypage.model.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class ReportRequestDto {

	private Integer boardNo;
	private String tblName;
	
	private String memberId;
}
