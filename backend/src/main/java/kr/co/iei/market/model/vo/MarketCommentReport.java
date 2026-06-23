// 1. 새 파일: kr.co.iei.market.model.vo.MarketCommentReport.java
package kr.co.iei.market.model.vo;
import org.apache.ibatis.type.Alias;
import lombok.Data;

@Data
@Alias(value="marketCommentReport")
public class MarketCommentReport {
    private Integer marketCommentNo;
    private String memberId;
    private String marketCommentReportReason;
}