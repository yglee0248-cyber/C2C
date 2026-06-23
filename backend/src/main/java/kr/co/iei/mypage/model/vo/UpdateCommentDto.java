package kr.co.iei.mypage.model.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class UpdateCommentDto {
	
	private Integer commentNo;
	private String newComment;
	private String type;
}
