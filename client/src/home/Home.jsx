const LIBRARY_API = "http://localhost:8080/api/library/toggle";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Home.css";
import GenreCards from "./GenreCards";

const API_BASE = "http://localhost:8080/api/tmdb";
const TMDB_IMAGE = "https://image.tmdb.org/t/p";

function normalizeItems(data) {
    return Array.isArray(data?.results) ? data.results : [];
}

function getTitle(item) {
    return item?.title || item?.name || "Untitled";
}

function getDate(item) {
    return item?.release_date || item?.first_air_date || "";
}

function getPoster(item) {
    return item?.poster_path
        ? `${TMDB_IMAGE}/w500${item.poster_path}`
        : null;
}

function getBackdrop(item) {
    return item?.backdrop_path
        ? `${TMDB_IMAGE}/original${item.backdrop_path}`
        : null;
}

function getRoute(item) {
    return item?.media_type === "tv"
        ? `/series/${item.id}`
        : `/movie/${item.id}`;
}

function MovieCard({ item, index }) {

    const [toast, setToast] = useState("");

    async function libraryAction(event, itemType) {
        event.preventDefault();
        event.stopPropagation();
        const token = localStorage.getItem("token");
        if (!token) {
            setToast("Please log in first");
            setTimeout(() => setToast(""), 2500);
            return;
        }
        setToast("Saving...");
        try {
            const response = await fetch(LIBRARY_API, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + token
                },
                body: JSON.stringify({
                    tmdbId: item.id,
                    mediaType: item.media_type === "tv" ? "series" : "movie",
                    itemType,
                    title: item.title || item.name || "Untitled",
                    posterPath: item.poster_path || ""
                })
            });
            const text = await response.text();
            console.log("LIBRARY:", response.status, text);
            if (!response.ok) throw new Error("HTTP " + response.status);
            const data = JSON.parse(text);
            const names = { queue: "Queue", favorite: "Favorites", watched: "Watched" };
            setToast(data.active ? "Added to " + names[itemType] : "Removed from " + names[itemType]);
        } catch (error) {
            console.error("LIBRARY ERROR:", error);
            setToast("Error: " + error.message);
        }
        setTimeout(() => setToast(""), 2500);
    }
    const title = getTitle(item);
    const poster = getPoster(item);
    const date = getDate(item);

    return (
        <Link to={getRoute(item)} className="home-content-card">
            <div className="home-card-poster">
                {poster ? (
                    <img
                        src={poster}
                        alt={title}
                        loading="lazy"
                        onError={(event) => {
                            event.currentTarget.style.display = "none";
                        }}
                    />
                ) : (
                    <div className="home-no-poster">
                        NO POSTER
                    </div>
                )}

                {index !== undefined && (
                    <span className="home-card-rank">
                        #{index + 1}
                    </span>
                )}

                {item?.vote_average > 0 && (
                    <span className="home-rating">
                        <span>★</span>
                        {Number(item.vote_average).toFixed(1)}
                    </span>
                )}

                <div className="home-card-hover">
                    <div className="home-card-play">
                        ▶
                    </div>
                </div>
            </div>

            <div className="home-card-details">
                <h3>{title}</h3>

                <div className="home-card-meta">
                    <span>
                        {date ? date.substring(0, 4) : "—"}
                    </span>
                    <i>•</i>
                    <span>
                        {item?.media_type === "tv"
                            ? "TV"
                            : "Movie"}
                    </span>
                </div>
            </div>
        </Link>
    );
}

function Section({
    eyebrow,
    title,
    items,
    loading,
    onLoadMore
}) {
    const rowRef = useRef(null);

    const scrollRow = (direction) => {
        if (!rowRef.current) return;
        rowRef.current.scrollBy({
            left: direction * 700,
            behavior: "smooth"
        });
    };
    return (
        <section className="home-section">
            <div className="home-section-header">
                <div>
                    <div className="home-section-eyebrow">
                        {eyebrow}
                    </div>
                    <h2>{title}</h2>

                </div>

                <div className="home-scroll-buttons">
                    <button
                        type="button"
                        className="home-scroll-button"
                        aria-label="Scroll left"
                        onClick={() => scrollRow(-1)}
                    >
                        {"\u2190"}
                    </button>
                    <button
                        type="button"
                        className="home-scroll-button"
                        aria-label="Scroll right"
                        onClick={() => scrollRow(1)}
                    >
                        {"\u2192"}
                    </button>
                </div>
            </div>

            <div ref={rowRef} className="home-card-row">

                {items.map((item, index) => (
                    <MovieCard
                        key={`${item.id}-${item.media_type || "x"}-${index}`}
                        item={item}
                        index={index}
                    />
                ))}

                {/* LOAD MORE IS PART OF THE POSTER ROW */}
                <div className="home-load-more-horizontal">
                    <button
                        type="button"
                        className="home-load-more"
                        onClick={onLoadMore}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="small-spinner" />
                                <span>Loading...</span>
                            </>
                        ) : (
                            <>
                                <span className="home-load-more-icon">
                                    +
                                </span>
                            </>
                        )}
                    </button>
                </div>

            </div>
        </section>
    );
}

function SearchHistory({ onSelect }) {
    const [history, setHistory] = useState([]);

    useEffect(() => {
        loadHistory();

        function handleHistoryUpdate() {
            loadHistory();
        }

        window.addEventListener(
            "nextinqueue-history-updated",
            handleHistoryUpdate
        );

        return () => {
            window.removeEventListener(
                "nextinqueue-history-updated",
                handleHistoryUpdate
            );
        };
    }, []);

    function loadHistory() {
        try {
            const saved = JSON.parse(
                localStorage.getItem(
                    "nextinqueue-search-history"
                ) || "[]"
            );

            setHistory(
                Array.isArray(saved)
                    ? saved.slice(0, 10)
                    : []
            );
        } catch (error) {
            console.error(
                "Could not load search history:",
                error
            );

            setHistory([]);
        }
    }

    function deleteHistoryItem(event, query) {
        event.preventDefault();
        event.stopPropagation();

        const updated = history.filter(
            (item) => item !== query
        );

        localStorage.setItem(
            "nextinqueue-search-history",
            JSON.stringify(updated)
        );

        setHistory(updated);

        window.dispatchEvent(
            new Event("nextinqueue-history-updated")
        );
    }

    function clearHistory(event) {
        event.preventDefault();
        event.stopPropagation();

        localStorage.removeItem(
            "nextinqueue-search-history"
        );

        setHistory([]);

        window.dispatchEvent(
            new Event("nextinqueue-history-updated")
        );
    }

    if (history.length === 0) {
        return (
            <div className="home-search-hint">
                <span>
                    SEARCH FOR MOVIES, TV SERIES OR ANIME
                </span>
            </div>
        );
    }

    return (
        <div className="home-search-history">

            <div className="home-search-history-title-row">
                <div className="home-search-history-title">
                    RECENT SEARCHES
                </div>

                <button
                    type="button"
                    className="home-search-history-clear"
                    onClick={clearHistory}
                >
                    Clear Search History
                </button>
            </div>

            <div className="home-search-history-list">
                {history.map((query, index) => (
                    <div
                        key={`${query}-${index}`}
                        className="home-search-history-item-wrap"
                    >
                        <button
                            type="button"
                            className="home-search-history-item"
                            onClick={() => onSelect(query)}
                        >
                            <span className="home-search-history-icon">
                                ↗
                            </span>

                            <span className="home-search-history-query">
                                {query}
                            </span>
                        </button>

                        <button
                            type="button"
                            className="home-search-history-delete"
                            aria-label={`Delete ${query}`}
                            onClick={(event) =>
                                deleteHistoryItem(
                                    event,
                                    query
                                )
                            }
                        >
                            ×
                        </button>
                    </div>
                ))}
            </div>

        </div>
    );
}
export default function Home() {
    const navigate = useNavigate();

    const [trending, setTrending] = useState([]);
    const [movies, setMovies] = useState([]);
    const [tv, setTv] = useState([]);
    const [anime, setAnime] = useState([]);

    const [trendingPage, setTrendingPage] = useState(1);
    const [moviesPage, setMoviesPage] = useState(1);
    const [tvPage, setTvPage] = useState(1);
    const [animePage, setAnimePage] = useState(1);

    const [loadingTrending, setLoadingTrending] = useState(false);
    const [loadingMovies, setLoadingMovies] = useState(false);
    const [loadingTv, setLoadingTv] = useState(false);
    const [loadingAnime, setLoadingAnime] = useState(false);

    const [heroIndex, setHeroIndex] = useState(0);

    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);

    const heroItems = useMemo(
        () =>
            trending
                .filter(
                    (item) =>
                        item?.backdrop_path ||
                        item?.poster_path
                )
                .slice(0, 8),
        [trending]
    );

    const heroItem =
        heroItems[heroIndex] || trending[0] || null;

    const cleanSuggestions = useMemo(() => {
        const seen = new Set();

        return suggestions.filter((item) => {
            const title = getTitle(item)
                .trim()
                .toLowerCase();

            if (!title || seen.has(title)) {
                return false;
            }

            seen.add(title);
            return true;
        });
    }, [suggestions]);

    async function fetchJson(url) {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(
                `Request failed: ${response.status}`
            );
        }

        return response.json();
    }

    async function loadTrending(page = 1, append = false) {
        try {
            setLoadingTrending(true);

            const data = await fetchJson(
                `${API_BASE}/trending?page=${page}`
            );

            const results = normalizeItems(data).map(
                (item) => ({
                    ...item,
                    media_type:
                        item.media_type ||
                        (item.first_air_date
                            ? "tv"
                            : "movie")
                })
            );

            setTrending((previous) =>
                append
                    ? [...previous, ...results]
                    : results
            );

            setTrendingPage(page);

            if (!append) {
                setHeroIndex(0);
            }
        } catch (error) {
            console.error("Trending error:", error);
        } finally {
            setLoadingTrending(false);
        }
    }

    async function loadMovies(page = 1, append = false) {
        try {
            setLoadingMovies(true);

            const data = await fetchJson(
                `${API_BASE}/popular/movies?page=${page}`
            );

            const results = normalizeItems(data).map(
                (item) => ({
                    ...item,
                    media_type: "movie"
                })
            );

            setMovies((previous) =>
                append
                    ? [...previous, ...results]
                    : results
            );

            setMoviesPage(page);
        } catch (error) {
            console.error("Movies error:", error);
        } finally {
            setLoadingMovies(false);
        }
    }

    async function loadTv(page = 1, append = false) {
        try {
            setLoadingTv(true);

            const data = await fetchJson(
                `${API_BASE}/popular/tv?page=${page}`
            );

            const results = normalizeItems(data).map(
                (item) => ({
                    ...item,
                    media_type: "tv"
                })
            );

            setTv((previous) =>
                append
                    ? [...previous, ...results]
                    : results
            );

            setTvPage(page);
        } catch (error) {
            console.error("TV error:", error);
        } finally {
            setLoadingTv(false);
        }
    }

    async function loadAnime(page = 1, append = false) {
        try {
            setLoadingAnime(true);

            const data = await fetchJson(
                `${API_BASE}/anime?page=${page}`
            );

            const results = normalizeItems(data).map(
                (item) => ({
                    ...item,
                    media_type: "tv"
                })
            );

            setAnime((previous) =>
                append
                    ? [...previous, ...results]
                    : results
            );

            setAnimePage(page);
        } catch (error) {
            console.error("Anime error:", error);
        } finally {
            setLoadingAnime(false);
        }
    }

    useEffect(() => {
        loadTrending();
        loadMovies();
        loadTv();
        loadAnime();
    }, []);

    useEffect(() => {
        if (heroItems.length <= 1) {
            return undefined;
        }

        const timer = setInterval(() => {
            setHeroIndex((previous) =>
                previous + 1 >= heroItems.length
                    ? 0
                    : previous + 1
            );
        }, 7000);

        return () => clearInterval(timer);
    }, [heroItems.length]);

    useEffect(() => {
        function handleOpenSearch() {
            setSearchOpen(true);

            setTimeout(() => {
                document
                    .getElementById("home-search-input")
                    ?.focus();
            }, 80);
        }

        window.addEventListener(
            "nextinqueue-open-search",
            handleOpenSearch
        );

        return () =>
            window.removeEventListener(
                "nextinqueue-open-search",
                handleOpenSearch
            );
    }, []);

    useEffect(() => {
        const query = searchQuery.trim();

        if (!query) {
            setSuggestions([]);
            return;
        }

        const timer = setTimeout(async () => {
            try {
                setSearchLoading(true);

                const data = await fetchJson(
                    `${API_BASE}/search?query=${encodeURIComponent(
                        query
                    )}&page=1`
                );

                setSuggestions(
                    normalizeItems(data)
                        .filter(
                            (item) =>
                                item.media_type === "movie" ||
                                item.media_type === "tv"
                        )
                        .slice(0, 15)
                );
            } catch (error) {
                console.error(
                    "Search suggestions error:",
                    error
                );
                setSuggestions([]);
            } finally {
                setSearchLoading(false);
            }
        }, 250);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    function saveSearchHistory(query) {
        const value = query.trim();

        if (!value) return;

        try {
            const existing = JSON.parse(
                localStorage.getItem("nextinqueue-search-history") || "[]"
            );

            const updated = [
                value,
                ...existing.filter(
                    (item) =>
                        item.toLowerCase() !== value.toLowerCase()
                )
            ].slice(0, 10);

            localStorage.setItem(
                "nextinqueue-search-history",
                JSON.stringify(updated)
            );
        } catch (error) {
            console.error(
                "Search history error:",
                error
            );
        }
    }

    function handleSearchSubmit() {
        const query = searchQuery.trim();

        if (!query) return;

        saveSearchHistory(query);

        setSearchOpen(false);

        navigate(
            `/search?q=${encodeURIComponent(query)}`
        );
    }

    function handleGenreSelect(genre) {
        navigate(
            `/genres?genreId=${genre.id}&genreName=${encodeURIComponent(
                genre.name
            )}`
        );
    }

    function openSuggestion(item) {
        const title = getTitle(item);

        if (title) {
            saveSearchHistory(title);
        }

        setSearchOpen(false);
        setSearchQuery("");
        setSuggestions([]);

        navigate(getRoute(item));
    }

    function clearSearchInput() {
        setSearchQuery("");
        setSuggestions([]);
    }

    function closeSearch() {
        setSearchOpen(false);
        setSearchQuery("");
        setSuggestions([]);
    }

    const heroBackdrop = heroItem
        ? getBackdrop(heroItem) || getPoster(heroItem)
        : null;

    return (
        <main className="nextinqueue-home">

            <section className="home-hero">

                {heroBackdrop && (
                    <div
                        className="home-hero-background"
                        style={{
                            backgroundImage: `url("${heroBackdrop}")`
                        }}
                    />
                )}

                <div className="home-hero-gradient" />
                <div className="home-hero-side-gradient" />

                {heroItem && (
                    <>
                        <div className="home-hero-content">

                            <div className="home-trending-label">
                                <i />
                                TRENDING NOW
                            </div>

                            <h1>
                                {getTitle(heroItem)}
                            </h1>

                            <div className="home-hero-meta">

                                <span className="home-rating">
                                    <span>★</span>
                                    {heroItem.vote_average
                                        ? Number(
                                              heroItem.vote_average
                                          ).toFixed(1)
                                        : "N/A"}
                                </span>

                                {getDate(heroItem) && (
                                    <span>
                                        {getDate(
                                            heroItem
                                        ).substring(0, 4)}
                                    </span>
                                )}

                                <span>
                                    {heroItem.media_type ===
                                    "tv"
                                        ? "TV Series"
                                        : "Movie"}
                                </span>

                            </div>

                            <p>
                                {heroItem.overview ||
                                    "Discover your next favorite story."}
                            </p>

                            <div className="home-hero-actions">

                                <Link
                                    to={getRoute(heroItem)}
                                    className="home-watch-button"
                                >
                                    Watch Now
                                </Link>

                                <Link
                                    to={getRoute(heroItem)}
                                    className="home-queue-button"
                                >
                                    View Details
                                </Link>

                            </div>

                        </div>

                        {getPoster(heroItem) && (
                            <div className="home-hero-poster">
                                <img
                                    src={getPoster(heroItem)}
                                    alt={getTitle(heroItem)}
                                />
                            </div>
                        )}
                    </>
                )}

                {heroItems.length > 1 && (
                    <div className="home-hero-dots">
                        {heroItems.map((item, index) => (
                            <button
                                key={`${item.id}-${index}`}
                                type="button"
                                className={
                                    index === heroIndex
                                        ? "active"
                                        : ""
                                }
                                onClick={() =>
                                    setHeroIndex(index)
                                }
                                aria-label={`Hero ${index + 1}`}
                            />
                        ))}
                    </div>
                )}

                {!heroItem && loadingTrending && (
                    <div className="home-hero-loading">
                        <div className="large-spinner" />
                    </div>
                )}

            </section>

            <div className="home-content">

                <Section
                    eyebrow="WHAT'S HOT"
                    title="Trending Now"
                    items={trending}
                    loading={loadingTrending}
                    onLoadMore={() =>
                        loadTrending(
                            trendingPage + 1,
                            true
                        )
                    }
                />

                <Section
                    eyebrow="MOVIES"
                    title="Popular Movies"
                    items={movies}
                    loading={loadingMovies}
                    onLoadMore={() =>
                        loadMovies(
                            moviesPage + 1,
                            true
                        )
                    }
                />

                <Section
                    eyebrow="SERIES"
                    title="Popular TV Series"
                    items={tv}
                    loading={loadingTv}
                    onLoadMore={() =>
                        loadTv(
                            tvPage + 1,
                            true
                        )
                    }
                />

                <Section
                    eyebrow="ANIMATION"
                    title="Anime"
                    items={anime}
                    loading={loadingAnime}
                    onLoadMore={() =>
                        loadAnime(
                            animePage + 1,
                            true
                        )
                    }
                />

                <GenreCards
                    onSelect={handleGenreSelect}
                />

            </div>

            {searchOpen && (
                <div
                    className="home-search-overlay"
                    onClick={closeSearch}
                >
                    <div className="home-search-backdrop" />

                    <div
                        className="home-search-box"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >

                        <div className="home-search-top">

                            <div className="home-search-input-wrap">
                                <span>⌕</span>

                                <input
                                    id="home-search-input"
                                    type="text"
                                    value={searchQuery}
                                    onChange={(event) =>
                                        setSearchQuery(
                                            event.target.value
                                        )
                                    }
                                    onKeyDown={(event) => {
                                        if (
                                            event.key ===
                                            "Enter"
                                        ) {
                                            handleSearchSubmit();
                                        }
                                    }}
                                    placeholder="Search movies, TV series or anime..."
                                    autoFocus
                                />

                                {searchLoading && (
                                    <span className="search-mini-loader" />
                                )}
                            </div>

                            <button
                                type="button"
                                className="home-search-close"
                                onClick={clearSearchInput}
                                aria-label="Clear search"
                            >
                                ×
                            </button>

                        </div>

                        {searchQuery.trim() ? (
                            <div className="home-search-results">

                                <div className="home-search-results-scroll">

                                    {suggestions.map(
                                        (item, index) => (
                                            <button
                                                key={`${item.id}-${index}`}
                                                type="button"
                                                className="home-search-result"
                                                onClick={() =>
                                                    openSuggestion(item)
                                                }
                                            >
                                                <div className="home-search-result-text">
                                                    <h3>
                                                        {getTitle(item)}
                                                    </h3>

                                                    <p>
                                                        {item.media_type ===
                                                        "tv"
                                                            ? "TV Series"
                                                            : "Movie"}
                                                        {" • "}
                                                        {getDate(item)
                                                            ? getDate(item).substring(
                                                                  0,
                                                                  4
                                                              )
                                                            : "—"}
                                                    </p>
                                                </div>

                                                <span className="home-search-result-arrow">
                                                    →
                                                </span>
                                            </button>
                                        )
                                    )}

                                    {!searchLoading &&
                                        suggestions.length === 0 && (
                                            <div className="home-search-empty">
                                                No results found.
                                            </div>
                                        )}

                                </div>

                                <button
                                    type="button"
                                    className="home-view-all"
                                    onClick={handleSearchSubmit}
                                >
                                    <span>
                                        View All Results
                                    </span>

                                    <span>
                                        →
                                    </span>
                                </button>

                            </div>
                        ) : (
                            <SearchHistory
                                onSelect={(query) =>
                                    setSearchQuery(query)
                                }
                            />
                        )}

                    </div>
                </div>
            )}

        </main>
    );
}

