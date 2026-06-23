package kr.co.iei.mypage.model.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class CommentUpdateDto {
	
	private Integer commentNo;
	private Integer status;
}
