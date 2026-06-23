package kr.co.iei.market.model.dao;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;

import kr.co.iei.market.model.vo.CommentListItem;
import kr.co.iei.market.model.vo.ListItem;
import kr.co.iei.market.model.vo.Market;
import kr.co.iei.market.model.vo.MarketComment;
import kr.co.iei.market.model.vo.MarketCommentReport;
import kr.co.iei.market.model.vo.MarketFile;
import kr.co.iei.market.model.vo.MarketReport;
import kr.co.iei.market.model.vo.ScoreHistory;
import kr.co.iei.market.model.vo.TradeRequest;

@Mapper
public interface MarketDao {

	Integer selectMarketCount(ListItem request);

	List<Market> selectMarketList(ListItem request);

	int getNewMarketNo();

	int insertMarket(Market market);

	int insertMarketFile(MarketFile marketFile);
	
	List<Market> selectMainPageMarketList(Map<String, Object> params);
	
	int deleteMarketFileList(List<String> deleteFilePath);
	
	int deleteMarket(Integer marketNo);
	
	List<MarketComment> selectMarketCommentList(Integer marketNo);
	
    int insertMarketComment(MarketComment marketComment);
    
    int deleteMarketComment(Integer commentNo);
    
    int updateMarketComment(MarketComment marketComment);
    
    int insertMarketCommentReport(MarketCommentReport report);

	Market selectOneMarket(Integer marketNo, String memberId);

	List<MarketFile> selectMarketFileList(Integer marketNo);

	int incrementViewCount(Integer marketNo);

	int selectLikeCount(Integer marketNo);

	int selectIsLike(Map<String, Object> params);

	int likeOn(Map<String, Object> params);

	int likeOff(Map<String, Object> params);

	List<String> getFilePath(Integer marketNo);

	int deleteFileTbl(Integer marketNo);

	int deleteOneMarket(Integer marketNo);

	List<TradeRequest> selectAllTradeRequest(Integer marketNo);

	int tradeAccepted(Integer marketNo, String buyerId);

	int tradeReject(Integer marketNo, String buyerId);

	int marketCompleted(Integer marketNo);

	int tradeRequest(TradeRequest request);

	int tradeRequestCancel(Integer marketNo, String buyerId);

	int cancelReport(Integer marketNo, String memberId);

	int pushReport(MarketReport marketReport);

	Market selectSellerId(Integer marketNo);

	int addPointHistory(Integer marketNo, String sellerId);
	
	int addPointHistory2(Integer marketNo, String buyerId);

	int addPointMember(String sellerId);
	
	int addPointMember2(String buyerId);

	int selectParentCommentCount(CommentListItem item);

	List<MarketComment> selectMarketCommentList(CommentListItem item);

	Integer selectOneCarbonContributionCount(String memberId, ListItem request);

	List<ScoreHistory> selectOneCarbonContributionList(String memberId, ListItem request);

	Market findOneMarketByMarketNo(Integer marketNo);
	
	int updateMarket(Market market);

	int deleteMarketFile(String marketFilePath);

	String getMarketWriter(Integer marketNo);

	MarketFile getHistoryMarketFile(String marketFilePath);

	void insertHistoryMarketFile(List<MarketFile> history);

	
	



}
