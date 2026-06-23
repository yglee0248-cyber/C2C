package kr.co.iei.community.model.vo;

import org.apache.ibatis.type.Alias;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Alias(value="communityComment")
public class CommunityComment {
	private Integer communityCommentNo;			// 댓글 번호 (PK)
	private String communityCommentContent;		// 댓글 내용
	private String communityCommentDate;		// 댓글 작성일
	private Integer communityNo;				// 커뮤니티 글 번호 (FK)
	private String communityCommentWriter;		// 댓글 작성자
	private Integer communityRecommentNo;		// DB 컬럼명에 맞춤 (대댓글 부모 번호-자기참조)
	private Integer isEdited; 			  		// 수정 여부 (0: 일반, 1: 수정됨)
	
	private String memberThumb;	// 프사
	private Integer likeCount;		// 좋아요수
	private Integer dislikeCount;	// 싫어요수
	private Integer isLike;			// 좋아요여부
	private Integer isDislike;		// 싫어요여부
	   
    private String hexCode;
    
    private String memberName;
}
