package com.nextinqueue.server.repository;

import com.nextinqueue.server.model.LibraryItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LibraryItemRepository
        extends JpaRepository<LibraryItem, Long> {

    List<LibraryItem> findByUserIdOrderByIdDesc(Long userId);

    Optional<LibraryItem> findByUserIdAndTmdbIdAndMediaTypeAndItemType(
            Long userId,
            Long tmdbId,
            String mediaType,
            String itemType
    );

    void deleteByUserIdAndTmdbIdAndMediaTypeAndItemType(
            Long userId,
            Long tmdbId,
            String mediaType,
            String itemType
    );

    void deleteByUserId(Long userId);
}
