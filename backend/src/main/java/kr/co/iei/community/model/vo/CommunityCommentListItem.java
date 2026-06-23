package kr.co.iei.community.model.vo;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class CommunityCommentListItem {
    private int communityNo;          // 게시글 번호
    private int page = 0;             // 현재 페이지 (기본값 0)
    private int size = 10;            // 한 페이지당 개수 (기본값 10)
    private String orderType = "newest"; // 정렬 기준 (기본값 최신순)
    private String memberId;		  // 내 아이디를 받을 변수
}