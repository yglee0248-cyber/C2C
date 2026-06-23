package kr.co.iei;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    
    @Value("${file.root}")
    private String root;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        
        // "file:///" 대신 "file:" 로 바꿨습니다
    	registry 
        .addResourceHandler("/editor/**")						// 요청 패턴
        .addResourceLocations("file:///" + root + "editor/");	// 실제 경로
    
    registry
        .addResourceHandler("/semi/**")							// 요청 패턴
        .addResourceLocations("file:///" + root + "semi/");		// 실제 경로
    
    registry													// 마켁게시판 글작성
    	.addResourceHandler("/market/**")	  					// 요청 패턴
    	.addResourceLocations("file:///" + root + "market/");   // 실제경로 
     
    
    }
}