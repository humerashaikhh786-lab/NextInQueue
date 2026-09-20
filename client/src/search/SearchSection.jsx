import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import "./SearchSection.css";

const API = import.meta.env.VITE_API_URL + "/api/tmdb";
const IMAGE_BASE = "https://image.tmdb.org/t/p";

function getTitle(item) {
    return item.title || item.name || "Untitled";
}

function getYear(item) {
    const date = item.release_date || item.first_air_date || "";
    return date ? date.substring(0, 4) : "";
}

function getType(item) {
    return item.media_type === "tv" ? "TV Series" : "Movie";
}

function getPath(item) {
    return item.media_type === "tv"
        ? `/series/${item.id}`
        : `/movie/${item.id}`;
}

function getPoster(item) {
    return item.poster_path
        ? `${IMAGE_BASE}/w500${item.poster_path}`
        : null;
}

function PosterCard({ item }) {
    return (
        <Link to={getPath(item)} className="search-result-card">
            <div className="search-poster-wrap">
                {getPoster(item) ? (
                    <img
                        src={getPoster(item)}
                        alt={getTitle(item)}
                        className="search-poster"
                    />
                ) : (
                    <div className="search-no-poster">
                        <span>??</span>
                    </div>
                )}

                <div className="search-poster-overlay">
                    <span>?</span>
                </div>

                <div className="search-card-rating">
                    ?{" "}
                    {item.vote_average
                        ? item.vote_average.toFixed(1)
                        : "N/A"}
                </div>
            </div>

            <div className="search-card-info">
                <h3>{getTitle(item)}</h3>
                <p>
                    {getType(item)}
                    {getYear(item) ? ` â€¢ ${getYear(item)}` : ""}
                </p>
            </div>
        </Link>
    );
}

export default function SearchSection() {
    const [searchParams, setSearchParams] = useSearchParams();

    const queryFromUrl = searchParams.get("q") || "";

    const [input, setInput] = useState(queryFromUrl);
    const [results, setResults] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        setInput(queryFromUrl);

        if (!queryFromUrl.trim()) {
            setResults([]);
            setPage(0);
            setLoading(false);
            return;
        }

        loadInitialResults(queryFromUrl);
    }, [queryFromUrl]);

    async function requestPage(searchQuery, pageNumber) {
        const response = await fetch(
            `${API}/search?query=${encodeURIComponent(
                searchQuery
            )}&page=${pageNumber}`
        );

        if (!response.ok) {
            throw new Error("Search request failed");
        }

        return response.json();
    }

    async function loadInitialResults(searchQuery) {
        setLoading(true);
        setError("");
        setResults([]);
        setPage(0);

        try {
            const pages = await Promise.all([
                requestPage(searchQuery, 1),
                requestPage(searchQuery, 2),
                requestPage(searchQuery, 3),
                requestPage(searchQuery, 4),
            ]);

            const combined = [];
            let maximumPages = 1;

            pages.forEach((data) => {
                maximumPages = Math.max(
                    maximumPages,
                    data.total_pages || 1
                );

                const items = Array.isArray(data.results)
                    ? data.results
                    : [];

                items.forEach((item) => {
                    if (
                        item.media_type !== "movie" &&
                        item.media_type !== "tv"
                    ) {
                        return;
                    }

                    const exists = combined.some(
                        (existing) =>
                            existing.id === item.id &&
                            existing.media_type === item.media_type
                    );

                    if (!exists) {
                        combined.push(item);
                    }
                });
            });

            setResults(combined);
            setPage(Math.min(4, maximumPages));
            setTotalPages(maximumPages);
        } catch (err) {
            console.error(err);
            setError("Unable to load search results.");
        } finally {
            setLoading(false);
        }
    }

    async function handleLoadMore() {
        if (loadingMore || page >= totalPages) {
            return;
        }

        setLoadingMore(true);

        try {
            const nextPage = page + 1;
            const data = await requestPage(input.trim(), nextPage);

            const incoming = Array.isArray(data.results)
                ? data.results.filter(
                      (item) =>
                          item.media_type === "movie" ||
                          item.media_type === "tv"
                  )
                : [];

            setResults((previous) => {
                const combined = [...previous];

                incoming.forEach((item) => {
                    const exists = combined.some(
                        (existing) =>
                            existing.id === item.id &&
                            existing.media_type === item.media_type
                    );

                    if (!exists) {
                        combined.push(item);
                    }
                });

                return combined;
            });

            setPage(nextPage);
            setTotalPages(data.total_pages || totalPages);
        } catch (err) {
            console.error(err);
            setError("Unable to load more results.");
        } finally {
            setLoadingMore(false);
        }
    }

    function handleSubmit(event) {
        event.preventDefault();

        const value = input.trim();

        if (!value) {
            return;
        }

        setSearchParams({ q: value });
    }

    return (
        <main className="search-page">
            <div className="search-top-bar">
                <button
                    className="search-back-button"
                    onClick={() => window.history.back()}
                >
                    ? Back
                </button>
            </div>

            {!queryFromUrl.trim() ? (
                <section className="search-empty-state-page">
                    <span className="search-eyebrow">
                        DISCOVER
                    </span>

                    <h1>What are you looking for?</h1>

                    <p>
                        Search for movies, TV series and anime.
                    </p>

                    <form
                        className="search-large-form"
                        onSubmit={handleSubmit}
                    >
                        <span className="search-large-icon">
                            ?
                        </span>

                        <input
                            value={input}
                            onChange={(event) =>
                                setInput(event.target.value)
                            }
                            placeholder="Search movies, series, anime..."
                            autoFocus
                        />

                        <button type="submit">
                            Search
                        </button>
                    </form>
                </section>
            ) : (
                <>
                    <section className="search-results-header">
                        <span className="search-eyebrow">
                            SEARCH RESULTS
                        </span>

                        <h1>
                            Results for{" "}
                            <span>"{queryFromUrl}"</span>
                        </h1>

                        <p>
                            Discover movies and TV series matching
                            your search.
                        </p>
                    </section>

                    {loading ? (
                        <div className="search-loading">
                            <div className="search-spinner"></div>
                            <p>Finding your results...</p>
                        </div>
                    ) : error ? (
                        <div className="search-empty">
                            <div>??</div>
                            <h2>Something went wrong</h2>
                            <p>{error}</p>
                        </div>
                    ) : results.length === 0 ? (
                        <div className="search-empty">
                            <div>??</div>
                            <h2>No results found</h2>
                            <p>
                                Try a different movie, series or
                                anime title.
                            </p>
                        </div>
                    ) : (
                        <>
                            <section className="search-result-grid">
                                {results.map((item, index) => (
                                    <PosterCard
                                        key={`${item.media_type}-${item.id}-${index}`}
                                        item={item}
                                    />
                                ))}
                            </section>

                            {page < totalPages && (
                                <div className="search-load-more-wrap">
                                    <button
                                        className="search-load-more"
                                        onClick={handleLoadMore}
                                        disabled={loadingMore}
                                    >
                                        {loadingMore
                                            ? "Loading More..."
                                            : "Load More"}
                                    </button>

                                    <p>
                                        Showing{" "}
                                        {results.length} results
                                    </p>
                                </div>
                            )}
                        </>
                    )}
                </>
            )}
        </main>
    );
}

