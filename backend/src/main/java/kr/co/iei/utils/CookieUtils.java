package kr.co.iei.utils;

import org.springframework.stereotype.Component;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class CookieUtils {

	// 마켓게시판 쿠키조회
	public boolean alreadyViewed(HttpServletRequest request, int marketNo) {
		Cookie[] cookies = request.getCookies();

		if (cookies == null) {
			return false;
		}

		for (Cookie c : cookies) {
			if (c.getName().equals("view_" + marketNo)) {
				return true;
			}
		}
		return false;
	}

	// 마켓게시판 쿠키생성
	public void createCookie(HttpServletResponse response, int marketNo, int cookieTime) {
		Cookie cookie = new Cookie("view_" + marketNo, "true");
		cookie.setMaxAge(cookieTime);
		cookie.setPath("/");
		response.addCookie(cookie);
	}
}
