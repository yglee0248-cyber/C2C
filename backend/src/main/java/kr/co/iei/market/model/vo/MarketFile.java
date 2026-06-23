package kr.co.iei.market.model.vo;

import org.apache.ibatis.type.Alias;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Alias(value="marketFile")
public class MarketFile {
	private Integer marketFileNo;	//파일번호(PK)
	private String marketFileName;	//파일이름
	private String marketFilePath;	//파일경로
	private Integer marketNo;		//거래번호(FK)
	

}
