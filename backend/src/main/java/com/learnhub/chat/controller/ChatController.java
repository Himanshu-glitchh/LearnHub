package com.learnhub.chat.controller;

import com.learnhub.auth.repository.UserRepository;
import com.learnhub.chat.entity.ChatMessage;
import com.learnhub.chat.entity.ChatRoom;
import com.learnhub.chat.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;
    private final UserRepository userRepo;

    private Long userId(UserDetails ud) {
        return userRepo.findByEmail(ud.getUsername()).orElseThrow().getId();
    }

    @PostMapping("/rooms")
    public ResponseEntity<ChatRoom> getOrCreateRoom(@AuthenticationPrincipal UserDetails ud,
                                                     @RequestBody Map<String, Long> body) {
        Long tutorId = body.get("tutorId");
        return ResponseEntity.ok(chatService.getOrCreateRoom(userId(ud), tutorId));
    }

    @GetMapping("/rooms")
    public ResponseEntity<List<ChatRoom>> myRooms(@AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(chatService.myRooms(userId(ud)));
    }

    @GetMapping("/rooms/{roomId}/messages")
    public ResponseEntity<List<ChatMessage>> messages(@PathVariable Long roomId) {
        return ResponseEntity.ok(chatService.getMessages(roomId));
    }

    // Simple REST send — frontend polls /messages every 2s instead of WebSocket
    @PostMapping("/rooms/{roomId}/send")
    public ResponseEntity<ChatMessage> send(@PathVariable Long roomId,
                                             @AuthenticationPrincipal UserDetails ud,
                                             @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(chatService.sendMessage(roomId, userId(ud), body.get("content")));
    }
}
