package kr.co.iei.member.controller;

import java.util.Map;
import java.util.Random;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import kr.co.iei.member.model.service.MemberService;
import kr.co.iei.member.model.vo.LoginMember;
import kr.co.iei.member.model.vo.Member;
import kr.co.iei.member.model.vo.MemberListItem;
import kr.co.iei.member.model.vo.MemberListResponse;
import kr.co.iei.utils.EmailSender;
import kr.co.iei.utils.FileUtils;

@CrossOrigin(value = "*")
@RestController
@RequestMapping(value = "/members")
public class MemberController {

	@Autowired
	private MemberService memberService;

	@Autowired
	private EmailSender sender;

	@Autowired
	private FileUtils fileUtil;

	@Value("${file.root}")
	private String root;

	// 1. 회원가입
	@PostMapping
	public ResponseEntity<?> joinMember(@RequestBody Member member) {
		int result = memberService.insertMember(member);
		return ResponseEntity.ok(result);
	}

	// 2. 아이디 중복체크
	@GetMapping(value = "/exists")
	public ResponseEntity<?> dupCheckId(@RequestParam String memberId) {
		Member m = memberService.selectOneMember(memberId);
		return ResponseEntity.ok(m == null);
	}

	// 3. 이메일 인증
	@PostMapping(value = "/email-verification")
	public ResponseEntity<?> sendMail(@RequestBody Map<String, String> requestData) {
		String emailTitle = "C2C 이메일 인증번호입니다.";

		String receiverEmail = requestData.get("memberEmail");

		Random r = new Random();
		StringBuffer sb = new StringBuffer();

		for (int i = 0; i < 6; i++) {
			// 영어 대문자 / 영어 소문자 / 숫자 를 조합해서 6자리 랜덤코드 생성
			// 숫자(0~9) : r.nextInt(10);
			// 대문자(A~Z) : r.nextInt(26) + 65;
			// 소문자(a~z) : r.nextInt(26) + 97; -> 유니코드 안외워지니 걍 구글에 유니코드 알파벳 몇번부터인지 체크 ㄱ

			int flag = r.nextInt(3); // 0, 1, 2 -> 숫자, 대문자, 소문자 어떤걸 추출할지 랜덤으로 결정
			if (flag == 0) {
				sb.append(r.nextInt(10));
			} else if (flag == 1) {
				sb.append((char) (r.nextInt(26) + 65));
			} else if (flag == 2) {
				sb.append((char) (r.nextInt(26) + 97));
			}
		}
		String authCode = sb.toString();

		String emailContent = "<h1>안녕하세요. C2C(Customer To Carbon) 입니다.</h1>" + "<h3>인증번호는 [<b>" + authCode
				+ "</b>] 입니다.</h3>" + "<h3>화면으로 돌아가 인증번호를 입력해 주세요.</h3>";

		sender.sendMail(emailTitle, receiverEmail, emailContent);
		return ResponseEntity.ok(authCode);
	}

	// 4. 로그인
	@PostMapping(value = "/login")
	public ResponseEntity<?> login(@RequestBody Member member) {
		LoginMember loginMember = memberService.login(member);

		if (loginMember == null) {
			return ResponseEntity.status(404).build();
		} else {
			return ResponseEntity.ok(loginMember);
		}
	}

	// 5. 아이디 찾기
	@PostMapping(value = "/find-id")
	public ResponseEntity<?> findId(@RequestBody Member member) {
		String memberId = memberService.findId(member);

		if (memberId == null) {
			return ResponseEntity.status(404).build();
		} else {
			return ResponseEntity.ok(memberId);
		}
	}

	// 6. 비밀번호 찾기 (임시 비밀번호 발급 및 메일 전송)
	@PostMapping(value = "/find-pw")
	public ResponseEntity<?> findPw(@RequestBody Member member) {

		// 3번 로직 그대로 사용
		Random r = new Random();
		StringBuffer sb = new StringBuffer();

		for (int i = 0; i < 8; i++) {
			// 영어 대문자 / 영어 소문자 / 숫자 를 조합해서 8자리 랜덤코드 생성
			// 숫자(0~9) : r.nextInt(10);
			// 대문자(A~Z) : r.nextInt(26) + 65;
			// 소문자(a~z) : r.nextInt(26) + 97; -> 유니코드 안외워지니 걍 구글에 유니코드 알파벳 몇번부터인지 체크 ㄱ

			int flag = r.nextInt(3); // 0, 1, 2 -> 숫자, 대문자, 소문자 어떤걸 추출할지 랜덤으로 결정
			if (flag == 0) {
				sb.append(r.nextInt(10));
			} else if (flag == 1) {
				sb.append((char) (r.nextInt(26) + 65));
			} else if (flag == 2) {
				sb.append((char) (r.nextInt(26) + 97));
			}
		}

		String tempPw = sb.toString();

		member.setMemberPw(tempPw);

		// DB 업데이트 (회원가입이랑 마찬가지로 여기서 MemberService가 알아서 암호화 한 뒤 DB를 update)
		int result = memberService.updateTempPw(member);

		if (result > 0) { // 업데이트 성공시

			String emailTitle = "[C2C] 임시 비밀번호 발급 안내";
			String receiverEmail = member.getMemberEmail();

			String emailContent = "<h1>안녕하세요. C2C(Customer To Carbon) 입니다.</h1>"
					+ "<h3>회원님의 임시 비밀번호는 [ <b style='color:red;'>" + tempPw + "</b> ] 입니다.</h3>"
					+ "<h3>!!주의 꼭 읽어주세요!!</h3>" + "<h3>실제 당신의 기존 비밀번호가 임시비밀번호로 바뀐것 입니다!! </h3>"
					+ "<h3>!!!로그인 후 반드시 비밀번호를 변경해 주세요!!!</h3>";

			sender.sendMail(emailTitle, receiverEmail, emailContent);

			return ResponseEntity.ok(tempPw);
		} else {
			return ResponseEntity.status(404).build();
		}
	}

	// 정보 불러오기
	@GetMapping(value = "/{memberId}")
	public ResponseEntity<?> memberInfo(@PathVariable String memberId) {
		Member m = memberService.selectOneMember(memberId);
		return ResponseEntity.ok(m);
	}

	// 내 정보 비밀번호 인증
	@PostMapping(value = "/pw-auth")
	public ResponseEntity<?> memberAuth(@RequestBody Member memberAuth) {
		LoginMember member = memberService.login(memberAuth);
		if (member == null) {
			return ResponseEntity.status(404).build();
		} else {
			return ResponseEntity.ok(member);
		}
	}

	// 회원 프로필 썸네일 업데이트
	@PatchMapping(value = "/{memberId}/thumbnail/update")
	public ResponseEntity<?> updateThumbnail(@PathVariable String memberId, @ModelAttribute MultipartFile file) {
		String savepath = root + "semi/";
		String memberThumb = fileUtil.upload(savepath, file);

		Member m = new Member();
		m.setMemberThumb(memberThumb);
		m.setMemberId(memberId);

		int result = memberService.updateThumbnail(m, savepath);
		return ResponseEntity.ok(memberThumb);
	}

	// 회원 정보 수정 완료
	@PatchMapping(value = "/{memberId}")
	public ResponseEntity<?> memberUpdate(@PathVariable String memberId, @RequestBody Member member) {
		String savepath = root + "semi/";
		int result = memberService.memberUpdate(memberId, member, savepath);
		return ResponseEntity.ok(member);
	}

	// 회원 탈퇴
	@DeleteMapping(value = "/{memberId}")
	public ResponseEntity<?> memberDelete(@PathVariable String memberId) {
		String savepath = root + "semi/";
		int result = memberService.memberDelete(memberId, savepath);
		return ResponseEntity.ok(result);
	}

	// 비밀번호 변경
	@PatchMapping(value = "/update-pw")
	public ResponseEntity<?> updatePw(@RequestBody Member member) {
		int result = memberService.updatePw(member);

		if (result > 0) {
			return ResponseEntity.ok(result);
		} else {
			return ResponseEntity.status(404).build();
		}
	}
	
	// 전체 멤버 리스트
	@GetMapping
	public ResponseEntity<?> selectAllMember(@ModelAttribute MemberListItem request) {
		MemberListResponse response= memberService.selectAllMember(request);
		return ResponseEntity.ok(response);
	}

}