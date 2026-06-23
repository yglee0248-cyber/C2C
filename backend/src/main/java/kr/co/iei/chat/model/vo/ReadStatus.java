package kr.co.iei.chat.model.vo;

import org.apache.ibatis.type.Alias;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Alias("readStatus")
public class ReadStatus {

	private Long id;
	private Long messageId;
//	private Long memberId;
	private Long chatRoomId;
	private Integer isRead;	// 0: 안읽음 1: 읽음
	
	private String memberId;
}
