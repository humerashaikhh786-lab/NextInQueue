package com.nextinqueue.server.repository;

import com.nextinqueue.server.model.HistoryItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface HistoryRepository extends JpaRepository<HistoryItem, Long> {

    List<HistoryItem> findByUserIdOrderByIdDesc(Long userId);

    Optional<HistoryItem> findByUserIdAndTmdbIdAndMediaType(
            Long userId,
            Long tmdbId,
            String mediaType
    );

    void deleteByUserIdAndTmdbIdAndMediaType(
            Long userId,
            Long tmdbId,
            String mediaType
    );

    void deleteByUserId(Long userId);
}
