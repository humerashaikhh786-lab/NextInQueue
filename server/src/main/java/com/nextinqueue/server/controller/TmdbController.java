package com.nextinqueue.server.controller;

import com.nextinqueue.server.service.TmdbService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tmdb")
@CrossOrigin(origins = "http://localhost:5173")
public class TmdbController {

    private final TmdbService tmdbService;

    public TmdbController(TmdbService tmdbService) {
        this.tmdbService = tmdbService;
    }

    @GetMapping("/trending")
    public ResponseEntity<String> trending(
            @RequestParam(defaultValue = "1") int page
    ) {
        return ResponseEntity.ok(
                tmdbService.getTrending(page)
        );
    }

    @GetMapping("/search")
    public ResponseEntity<String> search(
            @RequestParam String query,
            @RequestParam(defaultValue = "1") int page
    ) {
        return ResponseEntity.ok(
                tmdbService.search(query, page)
        );
    }

    @GetMapping("/movie/{id}")
    public ResponseEntity<String> movie(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(
                tmdbService.getMovieDetails(id)
        );
    }

    @GetMapping("/tv/{id}")
    public ResponseEntity<String> tv(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(
                tmdbService.getTvDetails(id)
        );
    }

    @GetMapping("/person/{id}")
    public ResponseEntity<String> person(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(
                tmdbService.getPersonDetails(id)
        );
    }

    @GetMapping("/movie/{id}/recommendations")
    public ResponseEntity<String> movieRecommendations(
            @PathVariable Long id,
            @RequestParam(defaultValue = "1") int page
    ) {
        return ResponseEntity.ok(
                tmdbService.getMovieRecommendations(id, page)
        );
    }

    @GetMapping("/tv/{id}/recommendations")
    public ResponseEntity<String> tvRecommendations(
            @PathVariable Long id,
            @RequestParam(defaultValue = "1") int page
    ) {
        return ResponseEntity.ok(
                tmdbService.getTvRecommendations(id, page)
        );
    }

    @GetMapping("/movie/{id}/watch-providers")
    public ResponseEntity<String> movieWatchProviders(
            @PathVariable Long id,
            @RequestParam(defaultValue = "IN") String region
    ) {
        return ResponseEntity.ok(
                tmdbService.getMovieWatchProviders(
                        id,
                        region
                )
        );
    }

    @GetMapping("/tv/{id}/watch-providers")
    public ResponseEntity<String> tvWatchProviders(
            @PathVariable Long id,
            @RequestParam(defaultValue = "IN") String region
    ) {
        return ResponseEntity.ok(
                tmdbService.getTvWatchProviders(
                        id,
                        region
                )
        );
    }

    @GetMapping("/popular/movies")
    public ResponseEntity<String> popularMovies(
            @RequestParam(defaultValue = "1") int page
    ) {
        return ResponseEntity.ok(
                tmdbService.getPopularMovies(page)
        );
    }

    @GetMapping("/popular/tv")
    public ResponseEntity<String> popularTv(
            @RequestParam(defaultValue = "1") int page
    ) {
        return ResponseEntity.ok(
                tmdbService.getPopularTv(page)
        );
    }

    @GetMapping("/anime")
    public ResponseEntity<String> anime(
            @RequestParam(defaultValue = "1") int page
    ) {
        return ResponseEntity.ok(
                tmdbService.getAnime(page)
        );
    }

    @GetMapping("/genre")
    public ResponseEntity<String> genre(
            @RequestParam String type,
            @RequestParam int genreId,
            @RequestParam(defaultValue = "1") int page
    ) {
        return ResponseEntity.ok(
                tmdbService.getGenreResults(
                        type,
                        genreId,
                        page
                )
        );
    }


    @GetMapping("/explore")
    public ResponseEntity<String> explore(
            @RequestParam(defaultValue = "all") String type,
            @RequestParam(defaultValue = "all") String genre,
            @RequestParam(defaultValue = "all") String language,
            @RequestParam(defaultValue = "all") String region,
            @RequestParam(defaultValue = "all") String year,
            @RequestParam(defaultValue = "popularity") String sort,
            @RequestParam(defaultValue = "1") int page
    ) {
        return ResponseEntity.ok(
                tmdbService.explore(
                        type,
                        genre,
                        language,
                        region,
                        year,
                        sort,
                        page
                )
        );
    }
    @GetMapping("/regions")
    public ResponseEntity<String> getRegions() {
        return ResponseEntity.ok(tmdbService.getRegions());
    }}
    