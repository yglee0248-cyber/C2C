package kr.co.iei.chat.model.vo;

import org.apache.ibatis.type.Alias;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Alias("chatParticipant")
public class ChatParticipant {
	
	private Long id;
	private Long chatRoomId;
//	private Long memberId;
	
	private String memberId;
}
