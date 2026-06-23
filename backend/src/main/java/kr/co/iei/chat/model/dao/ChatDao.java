package kr.co.iei.chat.model.dao;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;

import kr.co.iei.chat.model.vo.ChatMessage;
import kr.co.iei.chat.model.vo.ChatMessageDto;
import kr.co.iei.chat.model.vo.ChatParticipant;
import kr.co.iei.chat.model.vo.ChatRoom;
import kr.co.iei.chat.model.vo.ChatRoomAndMemberReqDto;
import kr.co.iei.chat.model.vo.ChatRoomListResDto;
import kr.co.iei.chat.model.vo.CreatePrivateRoomReqDto;
import kr.co.iei.chat.model.vo.MyChatListResDto;
import kr.co.iei.chat.model.vo.ReadStatus;
import kr.co.iei.member.model.vo.Member;

@Mapper
public interface ChatDao {


	ChatRoom findChatRoomById(Long roomId);

	Member findMemberById(String memberId);

	void saveChatMessage(ChatMessage chatMessage);

	List<ChatParticipant> findChatParticipantAllById(Long id);

	void saveReadStatus(ReadStatus readStatus);

	void saveChatRoom(ChatRoom chatRoom);

	void saveChatParticipant(ChatParticipant chatParticipant);

	Long getChatRoomId();

	Long getChatMessageId();

	List<ChatMessageDto> findByChatRoomId(Long id);

	void updateIsRead(ChatRoomAndMemberReqDto req);

	List<MyChatListResDto> getMyChatRooms(String memberId);

	Long getCountIsReadZero(ChatRoomAndMemberReqDto req);

	ChatRoom findExistingPrivateRoom(CreatePrivateRoomReqDto req);

	void deleteChatRoomByMarketNo(Long marketNo);	
	
}
