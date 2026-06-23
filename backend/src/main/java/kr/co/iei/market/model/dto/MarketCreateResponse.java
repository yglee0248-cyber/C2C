package kr.co.iei.market.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class MarketCreateResponse {
	private Integer marketNo;
    private Integer fileCount;

}
