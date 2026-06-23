package kr.co.iei.community.model.dao;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;

import kr.co.iei.community.model.vo.Community;
import kr.co.iei.community.model.vo.CommunityListItem;
import kr.co.iei.community.model.vo.CommunityComment;
import kr.co.iei.community.model.vo.CommunityCommentListItem;
import kr.co.iei.community.model.vo.CommunityCommentReport;

@Mapper
public interface CommunityDao {

	Integer selectCommunityCount(CommunityListItem request);

	List<Community> selectCommunityList(CommunityListItem request);
	
	int insertCommunity(Community community);
	
	Community selectOneCommunity(Integer communityNo);
	
	int updateCommunity(Community community);
	
	List<Community> selectMainPageCommunityList(Map<String, Object> map);
	
	int selectParentCommentCount(CommunityCommentListItem req);
	
	List<CommunityComment> selectCommunityCommentList(CommunityCommentListItem req);
	
	int insertCommunityComment(CommunityComment communityComment);
	
	int updateCommunityComment(CommunityComment comment);
	
	int deleteCommunityComment(Integer communityCommentNo);

	int selectCommentLikeCount(Integer communityCommentNo);
	
	int selectCommentDislikeCount(Integer communityCommentNo);
	
	int selectCommentIsLike(Map<String, Object> params);
	
	int selectCommentIsDislike(Map<String, Object> params);
	
	int commentLikeOn(Map<String, Object> params);
	
	int commentLikeOff(Map<String, Object> params);
	
	int commentDislikeOn(Map<String, Object> params);
	
	int commentDislikeOff(Map<String, Object> params);
	
	int insertCommentReport(CommunityCommentReport report);
	
	int deleteCommunity(Integer communityNo);

	int selectLikeCount(Integer communityNo);

	int selectIsLike(Map<String, Object> params);

	int insertLike(Map<String, Object> map);

	int deleteLike(Map<String, Object> map);

	int selectDislikeCount(Integer communityNo);

	int selectIsDislike(Map<String, Object> params);

	int insertDislike(Map<String, Object> map);

	int deleteDislike(Map<String, Object> map);

	int selectReportCount(Integer communityNo);
	
	int selectIsReport(Map<String, Object> params);
	
	int insertReport(Map<String, Object> params);

	int deleteReport(Map<String, Object> params);

	int updateViewCountCommunity(Community community);

}
