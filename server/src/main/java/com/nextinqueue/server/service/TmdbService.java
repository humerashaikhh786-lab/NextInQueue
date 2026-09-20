package com.nextinqueue.server.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class TmdbService {

    private final RestClient restClient;
    private final String apiKey;

    public TmdbService(
            @Value("${tmdb.base-url}") String baseUrl,
            @Value("${tmdb.api-key}") String apiKey
    ) {
        this.apiKey = apiKey;
        this.restClient = RestClient.builder()
                .baseUrl(baseUrl)
                .build();
    }

    public String getTrending(int page) {
        return restClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/trending/all/week")
                        .queryParam("api_key", apiKey)
                        .queryParam("page", page)
                        .build())
                .retrieve()
                .body(String.class);
    }

    public String search(String query, int page) {
        return restClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/search/multi")
                        .queryParam("api_key", apiKey)
                        .queryParam("query", query)
                        .queryParam("include_adult", false)
                        .queryParam("page", page)
                        .build())
                .retrieve()
                .body(String.class);
    }

    public String getMovieDetails(Long id) {
        return restClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/movie/{id}")
                        .queryParam("api_key", apiKey)
                        .queryParam("append_to_response", "credits")
                        .build(id))
                .retrieve()
                .body(String.class);
    }

    public String getTvDetails(Long id) {
        return restClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/tv/{id}")
                        .queryParam("api_key", apiKey)
                        .queryParam("append_to_response", "credits")
                        .build(id))
                .retrieve()
                .body(String.class);
    }

    public String getPersonDetails(Long id) {
        return restClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/person/{id}")
                        .queryParam("api_key", apiKey)
                        .queryParam("append_to_response", "movie_credits,tv_credits")
                        .build(id))
                .retrieve()
                .body(String.class);
    }

    public String getMovieRecommendations(Long id, int page) {
        return restClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/movie/{id}/recommendations")
                        .queryParam("api_key", apiKey)
                        .queryParam("page", page)
                        .build(id))
                .retrieve()
                .body(String.class);
    }

    public String getTvRecommendations(Long id, int page) {
        return restClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/tv/{id}/recommendations")
                        .queryParam("api_key", apiKey)
                        .queryParam("page", page)
                        .build(id))
                .retrieve()
                .body(String.class);
    }

    public String getMovieWatchProviders(Long id, String region) {
        return restClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/movie/{id}/watch/providers")
                        .queryParam("api_key", apiKey)
                        .build(id))
                .retrieve()
                .body(String.class);
    }

    public String getTvWatchProviders(Long id, String region) {
        return restClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/tv/{id}/watch/providers")
                        .queryParam("api_key", apiKey)
                        .build(id))
                .retrieve()
                .body(String.class);
    }

    public String getPopularMovies(int page) {
        return restClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/movie/popular")
                        .queryParam("api_key", apiKey)
                        .queryParam("page", page)
                        .build())
                .retrieve()
                .body(String.class);
    }

    public String getPopularTv(int page) {
        return restClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/tv/popular")
                        .queryParam("api_key", apiKey)
                        .queryParam("page", page)
                        .build())
                .retrieve()
                .body(String.class);
    }

    public String getAnime(int page) {
        return restClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/discover/tv")
                        .queryParam("api_key", apiKey)
                        .queryParam("page", page)
                        .queryParam("with_genres", 16)
                        .queryParam("sort_by", "popularity.desc")
                        .queryParam("with_original_language", "ja")
                        .build())
                .retrieve()
                .body(String.class);
    }

    public String getGenreResults(
            String type,
            int genreId,
            int page
    ) {
        boolean anime = "anime".equalsIgnoreCase(type);
        boolean movie = "movie".equalsIgnoreCase(type);

        String path = movie ? "/discover/movie" : "/discover/tv";

        String tvGenreId = switch (genreId) {
            case 28, 12 -> "10759";
            case 14, 878 -> "10765";
            default -> String.valueOf(genreId);
        };

        String selectedGenres = anime
                ? "16," + tvGenreId
                : movie
                    ? String.valueOf(genreId)
                    : tvGenreId;

        return restClient.get()
                .uri(uriBuilder -> {
                    var builder = uriBuilder
                            .path(path)
                            .queryParam("api_key", apiKey)
                            .queryParam("page", page)
                            .queryParam("with_genres", selectedGenres)
                            .queryParam("sort_by", "popularity.desc");

                    if (anime) {
                        builder.queryParam("with_original_language", "ja");
                    }

                    return builder.build();
                })
                .retrieve()
                .body(String.class);
    }

    public String explore(
            String type,
            String genre,
            String language,
            String region,
            String year,
            String sort,
            int page
    ) {
        String normalizedType = type == null ? "all" : type.toLowerCase();
        String path;

        if ("tv".equals(normalizedType) || "series".equals(normalizedType) || "anime".equals(normalizedType)) {
            path = "/discover/tv";
        } else {
            path = "/discover/movie";
        }

        String sortBy = "popularity".equalsIgnoreCase(sort)
                ? "popularity.desc"
                : "vote_average".equalsIgnoreCase(sort)
                    ? "vote_average.desc"
                    : "primary_release_date.desc";

        return restClient.get()
                .uri(uriBuilder -> {
                    var builder = uriBuilder
                            .path(path)
                            .queryParam("api_key", apiKey)
                            .queryParam("page", page)
                            .queryParam("sort_by", sortBy);

                    if (genre != null && !genre.isBlank() && !"all".equalsIgnoreCase(genre)) {
                        builder.queryParam("with_genres", genre);
                    }

                    if (language != null && !language.isBlank() && !"all".equalsIgnoreCase(language)) {
                        builder.queryParam("with_original_language", language);
                    }

                    if (region != null && !region.isBlank() && !"all".equalsIgnoreCase(region)) {
                        builder.queryParam("region", region);
                    }

                    if (year != null && !year.isBlank() && !"all".equalsIgnoreCase(year)) {
                        if ("tv".equals(normalizedType) || "series".equals(normalizedType) || "anime".equals(normalizedType)) {
                            builder.queryParam("first_air_date_year", year);
                        } else {
                            builder.queryParam("primary_release_year", year);
                        }
                    }

                    if ("anime".equals(normalizedType)) {
                        builder.queryParam("with_genres", 16);
                        builder.queryParam("with_original_language", "ja");
                    }

                    return builder.build();
                })
                .retrieve()
                .body(String.class);
    }
    public String getRegions() {
        return restClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/watch/providers/regions")
                        .queryParam("api_key", apiKey)
                        .build())
                .retrieve()
                .body(String.class);
    }}



