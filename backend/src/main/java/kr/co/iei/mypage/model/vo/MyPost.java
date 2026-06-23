package kr.co.iei.mypage.model.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class MyPost {
	private Integer rn;
	private Integer communityNo;
	private String communityTitle;
	private Integer marketNo;
	private String marketTitle;
	private Integer viewCount;
	private Integer likeCount;
	private String postDate;
}
