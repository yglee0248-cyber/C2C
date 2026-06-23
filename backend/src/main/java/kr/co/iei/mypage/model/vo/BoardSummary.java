package kr.co.iei.mypage.model.vo;

import org.apache.ibatis.type.Alias;

import com.fasterxml.jackson.annotation.JsonInclude;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Alias(value="boardSummary")
@JsonInclude(JsonInclude.Include.NON_NULL)
public class BoardSummary {
	
	private Integer boardNo;
	private String title;
	private String writerId;
	private String writerName;
	private String contentDate;
	private Integer contentStatus;
	private Integer viewCount;
	private Integer likeCount;
	private Integer dislikeCount;
	private Integer commentCount;
	private Integer reportCount;
	private Integer isLiked;
	private Integer isDisliked;
	private Integer isCommented;
	private Integer isReported;
	
	private Integer isCompleted;
	private String completedDate;
	
	private String boardType;
	private Integer writerGrade;
}

