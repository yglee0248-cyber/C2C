package kr.co.iei.mypage.model.vo;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class CommentListResponseDto {
	
	private List<CommentSummary> list;
	private Integer totalPage;
}
