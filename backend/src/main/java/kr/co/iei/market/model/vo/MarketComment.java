package kr.co.iei.market.model.vo;

import org.apache.ibatis.type.Alias;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Alias(value="marketComment")
public class MarketComment {
    private Integer marketCommentNo;      // 댓글 번호 (PK)
    private Integer marketNo;             // 게시글 번호 (FK)
    private String marketCommentWriter;   // DB 컬럼명에 맞춤 (작성자)
    private String marketCommentContent;  // 댓글 내용
    private String marketCommentDate;     // 작성일
    private Integer marketRecommentNo;    // DB 컬럼명에 맞춤 (대댓글 부모 번호-자기참조)
    private Integer isSecret;             // 비밀댓글 여부
    private Integer isEdited; 			  // 수정 여부 (0: 일반, 1: 수정됨)
    private String memberThumb;           // 프사 (JOIN용)
    
    private String hexCode;
    private String memberName;
}