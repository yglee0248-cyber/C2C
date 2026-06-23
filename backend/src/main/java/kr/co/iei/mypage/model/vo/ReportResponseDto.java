package kr.co.iei.mypage.model.vo;

import org.apache.ibatis.type.Alias;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Alias("report")
public class ReportResponseDto {
	
	private String writerId;
	private String writerName; 
	private String reason;
}
