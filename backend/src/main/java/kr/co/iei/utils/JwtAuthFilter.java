package kr.co.iei.utils;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationServiceException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import jakarta.servlet.GenericFilter;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtAuthFilter extends GenericFilter{
	@Value("${jwt.secret-key}")
	private String secretKey;

	@Override
	public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
			throws IOException, ServletException {
		
		HttpServletRequest httpServletRequest = (HttpServletRequest) request;
		HttpServletResponse httpServletResponse = (HttpServletResponse) response;
		String token = httpServletRequest.getHeader("Authorization");
		if (token == null) {
		    chain.doFilter(request, response);
		    return;
		}
		
		SecretKey key = Keys.hmacShaKeyFor(secretKey.getBytes());
		// 토큰 검증 및 claims 추출
		try {
			Claims claims = Jwts.parser()
					.setSigningKey(key)
					.build()
					.parseClaimsJws(token)
					.getBody();

			// Authentication 객체 생성
			List<GrantedAuthority> authorities = new ArrayList<>();
			UserDetails userDetails = new User(claims.get("memberId", String.class), "", authorities);
			Authentication authentication = new UsernamePasswordAuthenticationToken(userDetails, "",
					userDetails.getAuthorities());
			SecurityContextHolder.getContext().setAuthentication(authentication);
		} catch (Exception e) {
			httpServletResponse.setStatus(401);
			return;
		}
		
		chain.doFilter(request, response);
	}//
}
