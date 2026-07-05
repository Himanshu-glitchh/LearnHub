package com.learnhub.common.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.*;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/files")
public class FileUploadController {

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> upload(@RequestParam("file") MultipartFile file) throws IOException {
        // Validate type
        String contentType = file.getContentType() != null ? file.getContentType() : "";
        if (!contentType.startsWith("video/") && !contentType.startsWith("image/")
                && !contentType.equals("application/pdf")) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Only video, image, and PDF files are allowed"));
        }

        Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        Files.createDirectories(uploadPath);

        // Keep original extension, use UUID for filename
        String originalName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "file";
        String ext = originalName.contains(".")
                ? originalName.substring(originalName.lastIndexOf('.'))
                : "";
        String filename = UUID.randomUUID() + ext;

        Path dest = uploadPath.resolve(filename);
        Files.copy(file.getInputStream(), dest, StandardCopyOption.REPLACE_EXISTING);

        String fileUrl = "/api/v1/files/" + filename;
        return ResponseEntity.ok(Map.of(
                "url", fileUrl,
                "filename", filename,
                "originalName", originalName,
                "size", String.valueOf(file.getSize()),
                "type", contentType
        ));
    }

    @GetMapping("/{filename:.+}")
    public ResponseEntity<Resource> serve(@PathVariable String filename) throws MalformedURLException {
        Path filePath = Paths.get(uploadDir).toAbsolutePath().normalize().resolve(filename);
        Resource resource = new UrlResource(filePath.toUri());

        if (!resource.exists()) {
            return ResponseEntity.notFound().build();
        }

        String contentType = "application/octet-stream";
        String lower = filename.toLowerCase();
        if (lower.endsWith(".mp4"))  contentType = "video/mp4";
        else if (lower.endsWith(".webm")) contentType = "video/webm";
        else if (lower.endsWith(".pdf"))  contentType = "application/pdf";
        else if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) contentType = "image/jpeg";
        else if (lower.endsWith(".png"))  contentType = "image/png";

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                .body(resource);
    }
}
