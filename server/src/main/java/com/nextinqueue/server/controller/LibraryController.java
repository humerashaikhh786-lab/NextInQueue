package com.nextinqueue.server.controller;

import com.nextinqueue.server.model.LibraryItem;
import com.nextinqueue.server.model.User;
import com.nextinqueue.server.repository.LibraryItemRepository;
import com.nextinqueue.server.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/library")
@CrossOrigin(origins = "http://localhost:5173")
public class LibraryController {

    private final LibraryItemRepository libraryRepository;
    private final UserRepository userRepository;

    public LibraryController(
            LibraryItemRepository libraryRepository,
            UserRepository userRepository) {
        this.libraryRepository = libraryRepository;
        this.userRepository = userRepository;
    }

    private User getUser(Authentication authentication) {
        return userRepository
                .findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping
    public ResponseEntity<List<LibraryItem>> getLibrary(
            Authentication authentication) {

        User user = getUser(authentication);

        return ResponseEntity.ok(
                libraryRepository.findByUserIdOrderByIdDesc(user.getId())
        );
    }

    @PostMapping("/toggle")
    public ResponseEntity<?> toggle(
            Authentication authentication,
            @RequestBody Map<String, Object> body) {

        User user = getUser(authentication);

        Long tmdbId = Long.valueOf(
                String.valueOf(body.get("tmdbId"))
        );

        String mediaType = String.valueOf(
                body.getOrDefault("mediaType", "movie")
        );

        String itemType = String.valueOf(
                body.get("itemType")
        );

        String title = String.valueOf(
                body.getOrDefault("title", "")
        );

        String posterPath = String.valueOf(
                body.getOrDefault("posterPath", "")
        );

        if (!List.of("queue", "favorite", "watched").contains(itemType)) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Invalid library type"));
        }

        var existing =
                libraryRepository
                        .findByUserIdAndTmdbIdAndMediaTypeAndItemType(
                                user.getId(),
                                tmdbId,
                                mediaType,
                                itemType
                        );

        if (existing.isPresent()) {

            libraryRepository.delete(existing.get());

            return ResponseEntity.ok(
                    Map.of(
                            "active", false,
                            "itemType", itemType
                    )
            );
        }

        LibraryItem item = new LibraryItem(
                user.getId(),
                tmdbId,
                mediaType,
                itemType,
                title,
                posterPath
        );

        libraryRepository.save(item);

        return ResponseEntity.ok(
                Map.of(
                        "active", true,
                        "itemType", itemType
                )
        );
    }
}
