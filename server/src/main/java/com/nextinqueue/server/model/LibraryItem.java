package com.nextinqueue.server.model;

import jakarta.persistence.*;

@Entity
@Table(
    name = "library_items",
    uniqueConstraints = @UniqueConstraint(
        columnNames = {"user_id", "tmdb_id", "media_type", "item_type"}
    )
)
public class LibraryItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "tmdb_id", nullable = false)
    private Long tmdbId;

    @Column(name = "media_type", nullable = false)
    private String mediaType;

    @Column(name = "item_type", nullable = false)
    private String itemType;

    private String title;
    private String posterPath;

    public LibraryItem() {
    }

    public LibraryItem(
            Long userId,
            Long tmdbId,
            String mediaType,
            String itemType,
            String title,
            String posterPath) {
        this.userId = userId;
        this.tmdbId = tmdbId;
        this.mediaType = mediaType;
        this.itemType = itemType;
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

    public String getItemType() {
        return itemType;
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
