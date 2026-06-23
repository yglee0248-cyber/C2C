package kr.co.iei.member.model.vo;

import org.apache.ibatis.type.Alias;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Alias(value="member")
public class Member {
    private String memberId;
    private String memberPw;
    private String memberName;
    private String memberThumb;
    private String memberEmail;
    private Integer memberGrade;
    private String enrollDate;
    private String memberPostcode;
    private String memberAddr;        
    private String memberDetailAddr;  
    private Integer memberScore;      
    private Integer currentColorId;
    private String hexCode;
}