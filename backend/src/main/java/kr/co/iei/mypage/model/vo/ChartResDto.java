package kr.co.iei.mypage.model.vo;

import org.apache.ibatis.type.Alias;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Alias("chart")
public class ChartResDto {
	
	private String marketDate;
	private Integer totalCount;
	private Integer completedCount;
	private Integer incompletedCount;
}
