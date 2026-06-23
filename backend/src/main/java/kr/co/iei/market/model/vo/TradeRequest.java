package kr.co.iei.market.model.vo;

import org.apache.ibatis.type.Alias;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Alias(value = "tradeRequest")
public class TradeRequest {
	private Integer tradeNo;
	private Integer marketNo;
	private String buyerId;
	private String message;
	private Integer status;
	private String regDate;
	private String completeDate;
	
	
}
