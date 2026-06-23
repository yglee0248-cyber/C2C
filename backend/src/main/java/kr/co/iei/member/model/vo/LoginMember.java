package kr.co.iei.member.model.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class LoginMember {
    private String token;
    private String memberId;
    private Integer memberGrade;
    private String memberName; 
    private String memberThumb;
    private String memberAddr;
    private Long endTime;
	private String hexCode;
}