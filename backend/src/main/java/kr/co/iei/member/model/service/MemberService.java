package kr.co.iei.member.model.service;

import java.io.File;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import kr.co.iei.member.model.dao.MemberDao;
import kr.co.iei.member.model.vo.LoginMember;
import kr.co.iei.member.model.vo.Member;
import kr.co.iei.member.model.vo.MemberListItem;
import kr.co.iei.member.model.vo.MemberListResponse;
import kr.co.iei.utils.JwtUtils;

@Service
public class MemberService {

	@Autowired
	private MemberDao memberDao;

	@Autowired
	private BCryptPasswordEncoder bcrypt;

	@Autowired
	private JwtUtils jwtUtil;

	@Transactional
	public int insertMember(Member member) {
		String encPw = bcrypt.encode(member.getMemberPw());
		member.setMemberPw(encPw);

		int result = memberDao.insertMember(member);
		return result;
	}

	public Member selectOneMember(String memberId) {
		Member m = memberDao.selectOneMember(memberId);
		return m;
	}

	public LoginMember login(Member member) {
		Member loginMember = memberDao.selectOneMember(member.getMemberId());
		
		if (loginMember != null && bcrypt.matches(member.getMemberPw(), loginMember.getMemberPw())) {
			LoginMember login = jwtUtil.createToken(loginMember.getMemberId(), loginMember.getMemberGrade(), loginMember.getMemberAddr(), loginMember.getCurrentColorId(), loginMember.getHexCode());
			login.setMemberThumb(loginMember.getMemberThumb());
			login.setMemberName(loginMember.getMemberName());
			login.setMemberAddr(loginMember.getMemberAddr());	//마켓게시판 글 작성시 불러올 주소정보 추가 : 한진호
			login.setHexCode(loginMember.getHexCode());
			return login;
		}
		return null;
	}

	public String findId(Member member) {
		String memberId = memberDao.findId(member);
		return memberId;
	}

	@Transactional
	public int updateTempPw(Member member) {
		// 회원가입떄 했던 암호화 로직 그대로 쓰기
		String encPw = bcrypt.encode(member.getMemberPw());
		member.setMemberPw(encPw);

		int result = memberDao.updateTempPw(member);
		return result;
	}

	@Transactional
	public int updateThumbnail(Member m, String root) {
	    Member oldM = memberDao.selectOneMember(m.getMemberId());
	    String oldThumb = oldM.getMemberThumb();

	    int result = memberDao.updateThumbnail(m);

	    if (result == 1 && oldThumb != null) {
	        deleteFile(oldThumb, root);
	    }

	    return result;
	}

	@Transactional
	public int memberUpdate(String memberId, Member member, String root) {
		Member oldM = memberDao.selectOneMember(memberId);

		int result = memberDao.memberUpdate(member);

		if (result == 1 && oldM.getMemberThumb() != null 
		        && member.getMemberThumb() == null) {
			deleteFile(oldM.getMemberThumb(), root);
		}
		
		return result;
	}

	@Transactional
	private boolean deleteFile(String filename, String root) {
		if (filename == null || filename.isEmpty())
			return false;
		File file = new File(root + filename);
		if (file.exists()) {
			return file.delete();
		}
		return false;
	}

	@Transactional
	public int memberDelete(String memberId, String root) {
		Member m = memberDao.selectOneMember(memberId);
		
		int result = memberDao.memberDelete(memberId);
		
		if (result == 1 && m.getMemberThumb() != null ) {
			deleteFile(m.getMemberThumb(), root);
		}
		
		return result;
	}

	@Transactional
	public int updatePw(Member member) {
		String encPw = bcrypt.encode(member.getMemberPw());
		member.setMemberPw(encPw);

		int result = memberDao.updatePw(member);
		return result;
	}

	public MemberListResponse selectAllMember(MemberListItem request) {
		Integer totalCount = memberDao.selectMemberCount(request);
		int totalPage = (int) Math.ceil(totalCount / (double) request.getSize());
		
		List<Member> list= memberDao.selectAllMember(request);
		MemberListResponse response = new MemberListResponse(list,totalPage);
		return response;
	}

	public String getHexCode(String memberId) {
		String hexCode = memberDao.getHexCode(memberId);
		
		return hexCode;
	}//


}