package kr.co.iei.community.model.vo;

import org.apache.ibatis.type.Alias;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Alias(value="communityCommentReport")
public class CommunityCommentReport {
	private Integer communityCommentNo;
	private String memberId;
	private String communityCommentReportReason;
}
