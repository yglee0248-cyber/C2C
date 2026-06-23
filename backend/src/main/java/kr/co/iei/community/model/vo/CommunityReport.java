package kr.co.iei.community.model.vo;

import org.apache.ibatis.type.Alias;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Alias(value="communityReport")
public class CommunityReport {
	private String memberId;
	private Integer communityNo;
	private String communityReportReason;
}
