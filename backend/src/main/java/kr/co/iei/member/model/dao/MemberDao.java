package kr.co.iei.member.model.dao;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import kr.co.iei.member.model.vo.Member;
import kr.co.iei.member.model.vo.MemberListItem;
import kr.co.iei.member.model.vo.MemberListResponse;

@Mapper
public interface MemberDao {
	
    int insertMember(Member member);
    
    Member selectOneMember(String memberId);
    
    String findId(Member member);
    
    int updateTempPw(Member member);

	int updateThumbnail(Member m);

	int memberUpdate(Member member);

	int memberDelete(String memberId);

	int updatePw(Member member);

	List<Member> selectAllMember(MemberListItem request);

	Integer selectMemberCount(MemberListItem request);

	String getHexCode(String memberId);
}