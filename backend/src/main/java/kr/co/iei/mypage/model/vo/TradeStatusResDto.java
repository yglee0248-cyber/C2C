package kr.co.iei.mypage.model.vo;

import org.apache.ibatis.type.Alias;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Alias("tradeStatus")
public class TradeStatusResDto {

	private Integer marketNo;
	private String marketTitle;
	private String sellAddr;
	private Integer sellPrice;
	private Integer completed;
	private String completedDate;
}