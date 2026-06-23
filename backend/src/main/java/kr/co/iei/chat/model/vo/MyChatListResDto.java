package kr.co.iei.chat.model.vo;

import org.apache.ibatis.type.Alias;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Alias("myChatListResDto")
public class MyChatListResDto {

	private Long roomId;
	private String roomName;
	private String isGroupChat;
	private Long unReadCount;
	
	private String myId;
	private String myName;
	private String myHexCode;
	private String otherName;
	private String otherHexCode;
	private String otherId;
	private Long marketNo;
}
