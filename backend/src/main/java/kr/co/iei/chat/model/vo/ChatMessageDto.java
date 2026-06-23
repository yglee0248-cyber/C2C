package kr.co.iei.chat.model.vo;

import org.apache.ibatis.type.Alias;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Alias("chatMessageDto")
public class ChatMessageDto {
	
	private String message;
//	private String senderEmail;
	
	private String senderId;
	private String senderName;
	private String senderThumb;
	private String hexCode;
}
