package kr.co.iei.market.model.vo;

import org.apache.ibatis.type.Alias;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Alias(value="marketReport")
public class MarketReport {
	private Integer marketNo;
	private String memberId;
	private String marketReportReason;

}
