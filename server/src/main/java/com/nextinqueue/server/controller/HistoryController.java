package com.nextinqueue.server.controller;

import com.nextinqueue.server.model.HistoryItem;
import com.nextinqueue.server.model.User;
import com.nextinqueue.server.repository.HistoryRepository;
import com.nextinqueue.server.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/history")
@CrossOrigin(origins = "http://localhost:5173")
public class HistoryController {

    private final HistoryRepository historyRepository;
    private final UserRepository userRepository;

    public HistoryController(HistoryRepository historyRepository, UserRepository userRepository) {
        this.historyRepository = historyRepository;
        this.userRepository = userRepository;
    }

    private User getUser(Authentication authentication) {
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping
    public ResponseEntity<List<HistoryItem>> getHistory(Authentication authentication) {
        User user = getUser(authentication);
        return ResponseEntity.ok(
                historyRepository.findByUserIdOrderByIdDesc(user.getId())
        );
    }

    @PostMapping("/add")
    public ResponseEntity<?> addToHistory(
            Authentication authentication,
            @RequestBody Map<String, Object> body) {

        User user = getUser(authentication);

        Long tmdbId = Long.valueOf(String.valueOf(body.get("tmdbId")));
        String mediaType = String.valueOf(body.getOrDefault("mediaType", "movie"));
        String title = String.valueOf(body.getOrDefault("title", ""));
        String posterPath = String.valueOf(body.getOrDefault("posterPath", ""));

        var existing = historyRepository.findByUserIdAndTmdbIdAndMediaType(
                user.getId(), tmdbId, mediaType
        );

        if (existing.isPresent()) {
            HistoryItem item = existing.get();
            item.setTitle(title);
            item.setPosterPath(posterPath);
            historyRepository.save(item);

            return ResponseEntity.ok(Map.of("success", true));
        }

        historyRepository.save(
                new HistoryItem(
                        user.getId(),
                        tmdbId,
                        mediaType,
                        title,
                        posterPath
                )
        );

        return ResponseEntity.ok(Map.of("success", true));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteHistoryItem(
            Authentication authentication,
            @PathVariable Long id) {

        User user = getUser(authentication);

        var item = historyRepository.findById(id);

        if (item.isEmpty() || !item.get().getUserId().equals(user.getId())) {
            return ResponseEntity.notFound().build();
        }

        historyRepository.delete(item.get());

        return ResponseEntity.ok(Map.of("success", true));
    }

    @DeleteMapping("/clear")
    public ResponseEntity<?> clearHistory(Authentication authentication) {
        User user = getUser(authentication);
        historyRepository.deleteByUserId(user.getId());

        return ResponseEntity.ok(Map.of("success", true));
    }
}
