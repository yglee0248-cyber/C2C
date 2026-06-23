package kr.co.iei.market.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class MarketResponse<T> {
	//마켓 공통응답용 DTO 제네릭으로 확장가능
	private boolean success;
	private String message;
	private T data;
}
