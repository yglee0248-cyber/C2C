package kr.co.iei.market.model.vo;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
	//market 리스트와 페이지네이션용 totalPage 저장해서 전송할 객체
public class ListResponse {
	private List<?> items;
	private Integer totalPage;
}
