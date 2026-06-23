package kr.co.iei.community.model.vo;

import org.apache.ibatis.type.Alias;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Alias(value="community")
public class Community {
	private Integer communityNo;		// 커뮤니티 글 번호
	private String communityTitle;		// 제목
	private String communityContent;	// 내용
	private String communityDate;		// 작성일
	private Integer communityStatus;	// 글 공개 여부 (1:공개 2:비공개)
	private String memberThumb;			// 글 작성자 프로필 이미지
	private Integer memberGrade;		// 작성자 등급
	private String communityWriter; 	// 글 작성자
	private Integer likeCount;			// 좋아요 수
	private Integer dislikeCount;		// 싫어요 수
	private Integer reportCount;		// 신고 수
	private Integer viewCount;			// 조회수
	private Integer commentCount;		// 댓글 수
	   
    private String hexCode;
    
    private String memberName;
    
    private int isLike;
    private int isDislike;
}
