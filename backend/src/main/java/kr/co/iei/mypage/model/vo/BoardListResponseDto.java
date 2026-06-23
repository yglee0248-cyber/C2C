package kr.co.iei.mypage.model.vo;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class BoardListResponseDto {

	private List<BoardSummary> list;
	private Integer totalPage;
}
