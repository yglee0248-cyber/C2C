package kr.co.iei.mypage.model.vo;

import org.apache.ibatis.type.Alias;

import com.fasterxml.jackson.annotation.JsonInclude;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Alias(value="commentSummary")
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CommentSummary {
	
	private Integer commentNo;
	private String commentContent;
	private String commentDate;
	private Integer boardNo;
	private String writerId;
	private String writerName;
	private String writerThumb;
	private Integer reportCount;
	private Integer isReported;
	
	private Integer likeCount;
	private Integer isLiked;
	private Integer dislikeCount;
	private Integer isDisliked;
	
	private Integer isEdited;
}

