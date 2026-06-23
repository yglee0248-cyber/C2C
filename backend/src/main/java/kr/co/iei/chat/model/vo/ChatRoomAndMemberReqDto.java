package kr.co.iei.chat.model.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatRoomAndMemberReqDto {
	
	private Long chatRoomId;
//	private Long memberId;
	
	private String memberId;
}
