package kr.co.iei.chat.model.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import kr.co.iei.chat.model.dao.ChatDao;
import kr.co.iei.chat.model.vo.ChatMessage;
import kr.co.iei.chat.model.vo.ChatMessageDto;
import kr.co.iei.chat.model.vo.ChatParticipant;
import kr.co.iei.chat.model.vo.ChatRoom;
import kr.co.iei.chat.model.vo.ChatRoomAndMemberReqDto;
import kr.co.iei.chat.model.vo.ChatRoomListResDto;
import kr.co.iei.chat.model.vo.CreatePrivateRoomReqDto;
import kr.co.iei.chat.model.vo.MyChatListResDto;
import kr.co.iei.chat.model.vo.ReadStatus;
import kr.co.iei.common.exception.NotFoundException;
import kr.co.iei.market.model.dao.MarketDao;
import kr.co.iei.market.model.vo.Market;
import kr.co.iei.member.model.dao.MemberDao;
import kr.co.iei.member.model.vo.Member;

@Service
@Transactional
public class ChatService {

	@Autowired
	private ChatDao chatDao;
	@Autowired
	private MarketDao marketDao;
	@Autowired
	private MemberDao memberDao;

	public void saveMessage(Long roomId, ChatMessageDto chatMessageReqDto) {
		// 채팅방 조회
		ChatRoom chatRoom = chatDao.findChatRoomById(roomId);
		if (chatRoom == null) {
		    throw new NotFoundException("room cannot be found");
		}
		
		// 보낸 사람 조회
		Member sender = chatDao.findMemberById(chatMessageReqDto.getSenderId());
		if (sender == null) {
		    throw new NotFoundException("member cannot be found");
		}
		
		// 메시지 저장
		Long chatMessageId = chatDao.getChatMessageId();
		ChatMessage chatMessage = ChatMessage.builder()
				.id(chatMessageId)
				.chatRoomId(chatRoom.getId())
				.content(chatMessageReqDto.getMessage())
				.memberId(sender.getMemberId())
				.build();
		chatDao.saveChatMessage(chatMessage);
		
		// 사용자 별로 읽음 여부 저장
		List<ChatParticipant> chatParticipants = chatDao.findChatParticipantAllById(chatRoom.getId());
		for (ChatParticipant c : chatParticipants) {
			ReadStatus readStatus = new ReadStatus();
			readStatus.setChatRoomId(chatRoom.getId());
			readStatus.setMemberId(c.getMemberId());
			readStatus.setMessageId(chatMessage.getId());
			if (Objects.equals(sender.getMemberId(), c.getMemberId())) {
				readStatus.setIsRead(1); // 읽음
			} else {
				readStatus.setIsRead(0); // 안읽음
			}
			
			chatDao.saveReadStatus(readStatus);
		}
	}//

	// chatParticipant 객체 생성 후 저장 (그룹채팅, 1:1채팅 모두 사용)
	public void addParticipantToRoom(ChatRoom chatRoom, Member member) {
		ChatParticipant chatParticipant = ChatParticipant.builder()
				.chatRoomId(chatRoom.getId())
				.memberId(member.getMemberId())
				.build();
		
		chatDao.saveChatParticipant(chatParticipant);
	}//

	public List<ChatMessageDto> getChatHistory(Long roomId) {
		// 내가 해당 채팅방의 참여자가 아닐 경우 에러
		ChatRoom chatRoom = chatDao.findChatRoomById(roomId);
		if(chatRoom == null) {
			throw new NotFoundException("chatRoom can not be found");
		}

		Member member = chatDao.findMemberById(SecurityContextHolder.getContext().getAuthentication().getName());
		if(member == null) {
			throw new NotFoundException("member can not be found");
		}
		
		List<ChatParticipant> chatParticipants = chatDao.findChatParticipantAllById(chatRoom.getId());
		boolean check = false;
		for(ChatParticipant c : chatParticipants) {
			if(c.getMemberId().equals(member.getMemberId())) {
				check = true;
			}
		}
		if(!check) {
			throw new IllegalArgumentException("본인이 속하지 않은 채팅방 입니다.");
		}
		
		// 본인이 속한 채팅방의 경우 history 반환
		List<ChatMessageDto> list = chatDao.findByChatRoomId(chatRoom.getId());
				
		return list;
	}//

	public boolean isRoomParticipant(String memberId, Long roomId) {
		ChatRoom chatRoom = chatDao.findChatRoomById(roomId);
		if(chatRoom == null) {
			throw new NotFoundException("chatRoom can not be found");
		}
				
		Member member = chatDao.findMemberById(memberId);
		if(member == null) {
			throw new NotFoundException("member can not be found");
		}
		
		List<ChatParticipant> chatParticipants = chatDao.findChatParticipantAllById(chatRoom.getId());
		for(ChatParticipant c : chatParticipants) {
			if(c.getMemberId().equals(member.getMemberId())) {
				return true;
			}
		}
		
		return false;
	}//

	public void messageRead(Long roomId) {
		ChatRoom chatRoom = chatDao.findChatRoomById(roomId);
		if(chatRoom == null) {
			throw new NotFoundException("chatRoom can not be found");
		}
				
		Member member = chatDao.findMemberById(SecurityContextHolder.getContext().getAuthentication().getName());
		if(member == null) {
			throw new NotFoundException("member can not be found");
		}
		
		ChatRoomAndMemberReqDto req = new ChatRoomAndMemberReqDto(chatRoom.getId(), member.getMemberId());
		chatDao.updateIsRead(req);
	}//

	public List<MyChatListResDto> getMyChatRooms() {
		Member member = chatDao.findMemberById(SecurityContextHolder.getContext().getAuthentication().getName());
		if(member == null) {
			throw new NotFoundException("member can not be found");
		}
		
		List<MyChatListResDto> MyChatListResDtos = chatDao.getMyChatRooms(member.getMemberId());
		for(MyChatListResDto d :  MyChatListResDtos) {
			ChatRoomAndMemberReqDto req = new ChatRoomAndMemberReqDto(d.getRoomId(), member.getMemberId());
			Long count = chatDao.getCountIsReadZero(req);
			String myHexCode = memberDao.getHexCode(d.getMyId());
			String otherHexCode = memberDao.getHexCode(d.getOtherId());
			d.setMyHexCode(myHexCode);
			d.setOtherHexCode(otherHexCode);
			d.setUnReadCount(count == null ? 0 : count); 
		}
		
		return MyChatListResDtos;
	}//

	public Long getOrCreatePrivateRoom(String otherMemberId, Long marketNo) {
		Member member = chatDao.findMemberById(SecurityContextHolder.getContext().getAuthentication().getName());
		if(member == null) {
			throw new NotFoundException("member can not be found");
		}
		
		Member otherMember = chatDao.findMemberById(otherMemberId);
		if(otherMember == null) {
			throw new NotFoundException("member can not be found");
		}

		// 나와 상대방이 1:1 채팅에 이미 참석하고 있다면 해당 roomId return
		CreatePrivateRoomReqDto req = CreatePrivateRoomReqDto.builder()
				.memberId(member.getMemberId())
				.otherMemberId(otherMemberId)
				.marketNo(marketNo)
				.build(); 		
		ChatRoom chatRoom = chatDao.findExistingPrivateRoom(req);
		
		if(chatRoom != null) {
			return chatRoom.getId();
		}
		
		// 만약 1:1 채팅방이 없을 경우 채팅방 개설
		Market market = marketDao.findOneMarketByMarketNo(Math.toIntExact(marketNo)); 
				
		Long newRoomId = chatDao.getChatRoomId();
		ChatRoom newRoom = ChatRoom.builder()
				.id(newRoomId)
				.isGroupChat(1)
				.name(market.getMarketTitle())
				.marketNo(marketNo)
				.myName(member.getMemberName())
				.myId(member.getMemberId())
				.otherName(otherMember.getMemberName())
				.otherId(otherMemberId)
				.build();
		chatDao.saveChatRoom(newRoom);
		
		// 두 사람 모두 참여자로 새롭게 추가
		addParticipantToRoom(newRoom, member);
		addParticipantToRoom(newRoom, otherMember);
		
		return newRoom.getId();
	}//

	public void deleteChatRoomByMarketNo(Long marketNo) {
		chatDao.deleteChatRoomByMarketNo(marketNo);
	}//

	public ChatRoom findChatRoomById(Long roomId) {
		ChatRoom chatRoom = chatDao.findChatRoomById(roomId);
		
		return chatRoom;
	}//
}










