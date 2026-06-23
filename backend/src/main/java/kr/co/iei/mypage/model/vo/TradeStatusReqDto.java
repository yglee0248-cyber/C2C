package kr.co.iei.mypage.model.vo;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TradeStatusReqDto {
	
	private LocalDate start;
	private LocalDate end;
	private Integer complete;
	
	private Integer size;
	private Integer page;
}
