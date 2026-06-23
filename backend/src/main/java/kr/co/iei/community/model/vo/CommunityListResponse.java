package kr.co.iei.community.model.vo;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class CommunityListResponse {
	private List<?> items;
	private Integer totalPage;
}
