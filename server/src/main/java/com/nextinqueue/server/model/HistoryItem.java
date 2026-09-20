package com.nextinqueue.server.model;

import jakarta.persistence.*;

@Entity
@Table(
    name = "history_items",
    uniqueConstraints = @UniqueConstraint(
        columnNames = {"user_id", "tmdb_id", "media_type"}
    )
)
public class HistoryItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "tmdb_id", nullable = false)
    private Long tmdbId;

    @Column(name = "media_type", nullable = false)
    private String mediaType;

    private String title;

    private String posterPath;

    public HistoryItem() {
    }

    public HistoryItem(
            Long userId,
            Long tmdbId,
            String mediaType,
            String title,
            String posterPath) {

        this.userId = userId;
        this.tmdbId = tmdbId;
        this.mediaType = mediaType;
        this.title = title;
        this.posterPath = posterPath;
    }

    public Long getId() {
        return id;
    }

    public Long getUserId() {
        return userId;
    }

    public Long getTmdbId() {
        return tmdbId;
    }

    public String getMediaType() {
        return mediaType;
    }

    public String getTitle() {
        return title;
    }

    public String getPosterPath() {
        return posterPath;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setPosterPath(String posterPath) {
        this.posterPath = posterPath;
    }
}
