package kr.co.iei.market.model.vo;

import org.apache.ibatis.type.Alias;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Alias(value="scoreHistory")
public class ScoreHistory {
	   private Integer scoreNo;
	   private String memberId;
	   private Integer marketNo;
	   private String marketTitle;
	   private Integer historyStatus;
	   private Integer changedScore;
	   private String scoreDate;
}
