package kr.co.iei.utils;

import java.io.File;
import java.io.IOException;
import java.util.UUID;

import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

@Component
public class FileUtils {
	
	public String upload(String savepath, MultipartFile file) {
		// 사용자가 올린 원본 파일 이름
		String filename = file.getOriginalFilename();
		int dotIndex = filename.lastIndexOf(".");
		String extension = "";
		
		if(dotIndex != -1) {
			extension = filename.substring(dotIndex);
		}
		
		String uuid = UUID.randomUUID().toString();
		String filepath = uuid + extension;
		
		File savefile = new File(savepath + filepath);
		
		try {
			file.transferTo(savefile);
		} catch (IllegalStateException | IOException e) {
			e.printStackTrace();
		}
		
		return filepath;
	}
	
	private boolean deleteFile(String filename, String root) {
		if (filename == null || filename.isEmpty())
			return false;
		File file = new File(root + filename);
		if (file.exists()) {
			return file.delete(); // 파일 삭제 성공시 true 리턴
		}
		return false;
	}
	
	
}
