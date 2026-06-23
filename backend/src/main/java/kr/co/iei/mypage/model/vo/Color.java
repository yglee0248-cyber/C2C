package kr.co.iei.mypage.model.vo;

import org.apache.ibatis.type.Alias;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Alias(value="color")
public class Color {
	private Integer colorId;
	private String colorName;
	private String hexCode;
}
