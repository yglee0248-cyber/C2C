package kr.co.iei.mypage.model.dao;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import kr.co.iei.mypage.model.vo.BoardListRequestDto;
import kr.co.iei.mypage.model.vo.BoardSummary;
import kr.co.iei.mypage.model.vo.ChartResDto;
import kr.co.iei.mypage.model.vo.Color;
import kr.co.iei.mypage.model.vo.CommentSummary;
import kr.co.iei.mypage.model.vo.MemberColor;
import kr.co.iei.mypage.model.vo.MyPost;
import kr.co.iei.mypage.model.vo.ReportRequestDto;
import kr.co.iei.mypage.model.vo.ReportResponseDto;
import kr.co.iei.mypage.model.vo.TodayStats;
import kr.co.iei.mypage.model.vo.TradeStatusReqDto;
import kr.co.iei.mypage.model.vo.TradeStatusResDto;
import kr.co.iei.mypage.model.vo.UpdateCommentDto;
import kr.co.iei.mypage.model.vo.UpdateDto;

@Mapper
public interface MypageDao {

	List<BoardSummary> findCommunityAll(BoardListRequestDto request);

	int findCommunityCount(BoardListRequestDto request);

	int updateCommunityStatus(UpdateDto update);

	int deleteCommunity(int boardNo);

	List<BoardSummary> findMarketAll(BoardListRequestDto request);

	int findMarketAllCount(BoardListRequestDto request);

	int updateMarketStatus(UpdateDto update);

	int deleteMarket(int boardNo);

	List<CommentSummary> findMarketCommentAll(BoardListRequestDto request);

	int findMarketCommentAllCount(BoardListRequestDto request);

	int updateMarketComment(UpdateCommentDto update);

	int updateCommunityComment(UpdateCommentDto update);

	int deleteMarketComment(UpdateCommentDto delete);

	int deleteCommunityComment(UpdateCommentDto delete);

	List<CommentSummary> findCommunityCommentAll(BoardListRequestDto request);

	int findCommunityCommentAllCount(BoardListRequestDto request);

	List<ReportResponseDto> findMarketReportAll(ReportRequestDto request);

	List<ReportResponseDto> findCommunityReportAll(ReportRequestDto request);

	List<ReportResponseDto> findMarketCommentReportAll(ReportRequestDto request);

	List<ReportResponseDto> findCommunityCommentReportAll(ReportRequestDto request);

	List<BoardSummary> findLikeDislikeAll(BoardListRequestDto request);

	int findLikeDislikeCount(BoardListRequestDto request);

	List<ChartResDto> findChartAll(TradeStatusReqDto request);

	List<TradeStatusResDto> findListAll(TradeStatusReqDto request);

	int findListAllCount(TradeStatusReqDto request);

	List<TodayStats> todayOneCounts(String memberId);
	
	List<MyPost> myBestPost(String memberId);

	List<MyPost> myRecentPost(String memberId);

	List<Color> selectColorList();

	int updateCurrentColor(MemberColor memberColor);

	int updateMemberScore(MemberColor memberColor);
	ReportResponseDto findMarketReportPrivate(ReportRequestDto request);

	ReportResponseDto findCommunityReportPrivate(ReportRequestDto request);

	ReportResponseDto findMarketCommentReportPrivate(ReportRequestDto request);

	ReportResponseDto findCommunityCommentReportPrivate(ReportRequestDto request);

	int insertHistory(MemberColor memberColor);
	
	
}
