package kr.co.iei.mypage.model.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor	
@Data
public class TodayStats {
	private String today;
	private Integer communityCount;
	private Integer marketCount;
}
