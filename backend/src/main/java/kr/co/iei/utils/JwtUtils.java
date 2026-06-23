package kr.co.iei.utils;

import java.util.Calendar;
import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import kr.co.iei.member.model.vo.LoginMember;

@Component
public class JwtUtils {
	
	@Value("${jwt.secret-key}")
	private String secretKey;
	@Value("${jwt.expire-hour}")
	private int expireHour;
	
	// 유효시간 1시간 토큰 생성
	public LoginMember createToken(String memberId, Integer memberGrade, String memberAddr, Integer integer, String hexCode) {
		// 1. 미리 작성해 둔 키 값을 이용해서 암호화 코드 생성
		SecretKey key = Keys.hmacShaKeyFor(secretKey.getBytes());
		
		// 2. 토큰 생성시간 / 만료시간 설정 (java.util.Date 타입)
		// 시간연산을 사용하기 위해 Calendar 객체 사용 Date 는 시간연산 불가능
		Calendar c = Calendar.getInstance();
		Date startTime = c.getTime();
		c.add(Calendar.HOUR, expireHour);
		Date endTime = c.getTime();
		
		String token = Jwts.builder()
							.issuedAt(startTime)				// 토큰 발행시간
							.expiration(endTime)				// 토큰 만료시간
							.signWith(key)						// 암호화 서명
							.claim("memberId", memberId)		// 토큰에 포함 될 부가정보
							.claim("memberGrade", memberGrade)	// 토큰에 포함 될 부가정보
							.claim("memberAddr", memberAddr)
							.claim("hexCode", hexCode)
							.compact();							// 생성
		
		LoginMember login = new LoginMember();
		login.setMemberGrade(memberGrade);
		login.setMemberId(memberId);
		login.setMemberAddr(memberAddr);
		login.setToken(token);
		login.setEndTime(c.getTimeInMillis());
		login.setHexCode(hexCode);
		
		return login;
	}//
	
	public LoginMember checkToken(String token) {
		SecretKey key = Keys.hmacShaKeyFor(secretKey.getBytes());
		
		Claims claims = (Claims)Jwts.parser()
									.verifyWith(key)
									.build()
									.parse(token)
									.getPayload();
		
		String memberId = (String) claims.get("memberId");
		Integer memberGrade = (Integer) claims.get("memberGrade");
		String memberAddr = (String) claims.get("memberAddr");
		String hexCode = (String) claims.get("hexCode");
		
		LoginMember login = new LoginMember();
		login.setMemberId(memberId);
		login.setMemberGrade(memberGrade);
		login.setMemberAddr(memberAddr);
		login.setHexCode(hexCode);
		
		return login;
	}//

}
