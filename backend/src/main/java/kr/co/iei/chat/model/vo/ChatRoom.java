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
@Alias("chatRoom")
public class ChatRoom {
	
	private Long id;
	private String name;			// 채팅방 이름
	private Integer isGroupChat;	// 1: 그룹X / 2: 그룹O
	private Long marketNo;
	
	private String myName;
	private String myId;
	private String otherName;
	private String otherId;
}
