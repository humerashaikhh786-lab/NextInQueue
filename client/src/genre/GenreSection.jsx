import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import "./GenreSection.css";

const API_BASE = import.meta.env.VITE_API_URL + "/api/tmdb";

const GENRE_DESCRIPTIONS = {
    Action: "High-energy adventures, intense battles and unforgettable heroes.",
    Adventure: "Epic journeys, hidden worlds and stories waiting to be discovered.",
    Animation: "Beautiful animated worlds filled with imagination and unforgettable characters.",
    Comedy: "Light-hearted stories, unforgettable characters and plenty of laughs.",
    Crime: "Secrets, investigations, criminals and stories where nothing is as it seems.",
    Drama: "Powerful characters and stories that stay with you.",
    Fantasy: "Magic, mythical worlds and extraordinary adventures.",
    Horror: "Dark stories, terrifying moments and mysteries from beyond the ordinary.",
    Mystery: "Uncover secrets, follow the clues and find the truth.",
    Romance: "Love stories, relationships and unforgettable connections.",
    "Science Fiction": "Beyond reality \u2014 futuristic worlds, technology and the unknown.",
    Thriller: "Suspense, danger and stories that keep you guessing."
};

function getTitle(item) {
    return item?.title || item?.name || "Untitled";
}

function getDate(item) {
    return item?.release_date || item?.first_air_date || "";
}

function getYear(item) {
    const date = getDate(item);
    return date ? date.substring(0, 4) : "\u2014";
}

function getType(item) {
    return item?.media_type === "tv" ? "TV Series" : "Movie";
}

function getRoute(item) {
    return item?.media_type === "tv"
        ? `/series/${item.id}`
        : `/movie/${item.id}`;
}

function GenreCard({ item }) {
    const poster = item?.poster_path
        ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
        : null;

    return (
        <Link to={getRoute(item)} className="genre-result-card">
            <div className="genre-result-poster">
                {poster ? (
                    <img
                        src={poster}
                        alt={getTitle(item)}
                        loading="lazy"
                    />
                ) : (
                    <div className="genre-no-poster">
                        NO POSTER
                    </div>
                )}

                {item?.vote_average > 0 && (
                    <span className="genre-result-rating">
                        ? {Number(item.vote_average).toFixed(1)}
                    </span>
                )}

                <span className="genre-result-type">
                    {getType(item)}
                </span>

                <div className="genre-result-overlay">
                    <span className="genre-play">▶</span>
                </div>
            </div>

            <div className="genre-result-info">
                <h3>{getTitle(item)}</h3>

                <div className="genre-result-meta">
                    <span>{getYear(item)}</span>
                    <span>•</span>
                    <span>{getType(item)}</span>
                </div>
            </div>
        </Link>
    );
}

const TV_GENRE_MAP = {
    28: 10759,
    12: 10759,
    14: 10765,
    878: 10765,
    16: 16,
    35: 35,
    80: 80,
    99: 99,
    18: 18,
    10751: 10751,
    36: 36,
    27: 27,
    10402: 10402,
    9648: 9648,
    10749: 10749,
    53: 53,
    37: 37,
    10752: 10768
};

function tvGenreFor(movieGenreId) {
    return TV_GENRE_MAP[Number(movieGenreId)] || Number(movieGenreId);
}

async function fetchGenre(type, genreId, pageNumber) {
    const response = await fetch(
        `${API_BASE}/genre?type=${encodeURIComponent(type)}&genreId=${encodeURIComponent(genreId)}&page=${pageNumber}`
    );

    if (!response.ok) {
        throw new Error(`Genre request failed: ${response.status}`);
    }

    const data = await response.json();

    return Array.isArray(data)
        ? data
        : Array.isArray(data?.results)
            ? data.results
            : [];
}

export default function GenreSection() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const genreId = searchParams.get("genreId");
    const genreName = searchParams.get("genreName") || "All Genres";
    const initialType = searchParams.get("type") || "all";

    const [contentType, setContentType] = useState(
        initialType === "tv" || initialType === "series"
            ? "tv"
            : initialType === "anime"
                ? "anime"
                : initialType === "movie"
                    ? "movie"
                    : "all"
    );

    const [results, setResults] = useState([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState("");

    const description =
        GENRE_DESCRIPTIONS[genreName] ||
        `Explore the best movies and series in the ${genreName} genre.`;

    async function loadSingleType(type, pageNumber = 1) {
        if (type === "movie") {
            return fetchGenre("movie", genreId, pageNumber).then(
                items =>
                    items.map(item => ({
                        ...item,
                        media_type: "movie"
                    }))
            );
        }

        if (type === "tv") {
            return fetchGenre(
                "tv",
                tvGenreFor(genreId),
                pageNumber
            ).then(
                items =>
                    items.map(item => ({
                        ...item,
                        media_type: "tv"
                    }))
            );
        }

        if (type === "anime") {
            const items = await fetchGenre(
                "anime",
                genreId,
                pageNumber
            );

            return items
                .filter(item => {
                    const genres = Array.isArray(item.genre_ids)
                        ? item.genre_ids.map(Number)
                        : [];

                    const selectedGenre = Number(genreId);

                    if (selectedGenre === 16) {
                        return genres.includes(16);
                    }

                    const mappedGenre = Number(
                        tvGenreFor(selectedGenre)
                    );

                    return (
                        genres.includes(16) &&
                        genres.includes(mappedGenre)
                    );
                })
                .map(item => ({
                    ...item,
                    media_type: "tv"
                }));
        }

        return [];
    }

    async function loadGenreResults(
        pageNumber = 1,
        append = false,
        selectedType = contentType
    ) {
        if (!genreId) {
            setResults([]);
            setLoading(false);
            return;
        }

        try {
            if (append) {
                setLoadingMore(true);
            } else {
                setLoading(true);
            }

            setError("");

            let nextResults = [];

            if (selectedType === "all") {
                const [movies, tv, anime] = await Promise.all([
                    loadSingleType("movie", pageNumber),
                    loadSingleType("tv", pageNumber),
                    loadSingleType("anime", pageNumber)
                ]);

                nextResults = [
                    ...movies,
                    ...tv,
                    ...anime
                ];
            } else {
                nextResults = await loadSingleType(
                    selectedType,
                    pageNumber
                );
            }

            const unique = [];
            const seen = new Set();

            for (const item of nextResults) {
                const key = `${item.media_type}-${item.id}`;

                if (!seen.has(key)) {
                    seen.add(key);
                    unique.push(item);
                }
            }

            if (append) {
                setResults(previous => {
                    const existing = new Set(
                        previous.map(
                            item => `${item.media_type}-${item.id}`
                        )
                    );

                    return [
                        ...previous,
                        ...unique.filter(
                            item =>
                                !existing.has(
                                    `${item.media_type}-${item.id}`
                                )
                        )
                    ];
                });
            } else {
                setResults(unique);
            }

            setPage(pageNumber);
        } catch (err) {
            console.error("Genre loading error:", err);
            setError(
                `Unable to load ${genreName} results right now.`
            );
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }

    useEffect(() => {
        setResults([]);
        setPage(1);
        loadGenreResults(1, false, contentType);
    }, [genreId, contentType]);

    function changeContentType(type) {
        setContentType(type);
    }

    function handleLoadMore() {
        if (loadingMore || loading) {
            return;
        }

        loadGenreResults(
            page + 1,
            true,
            contentType
        );
    }

    return (
        <main className="genre-page">
            <div className="genre-page-inner">

                <button
                    type="button"
                    className="genre-back-button"
                    onClick={() => navigate(-1)}
                >
                    <span
                        className="genre-back-arrow"
                        aria-hidden="true"
                    ></span>
                    Back
                </button>

                <section className="genre-hero">
                    <div className="genre-hero-glow" />

                    <div className="genre-hero-content">
                        <p className="genre-hero-label">
                            GENRE DISCOVERY
                        </p>

                        <h1>{genreName}</h1>

                        <p className="genre-hero-description">
                            {description}
                        </p>
                    </div>
                </section>

                <section className="genre-content">

                    <div className="genre-toolbar">
                        <div>
                            <p className="genre-section-label">
                                EXPLORE
                            </p>

                            <h2>{genreName}</h2>
                        </div>

                        <div className="genre-tabs">

                            <button
                                type="button"
                                className={
                                    contentType === "all"
                                        ? "active"
                                        : ""
                                }
                                onClick={() =>
                                    changeContentType("all")
                                }
                            >
                                All
                            </button>

                            <button
                                type="button"
                                className={
                                    contentType === "movie"
                                        ? "active"
                                        : ""
                                }
                                onClick={() =>
                                    changeContentType("movie")
                                }
                            >
                                Movies
                            </button>

                            <button
                                type="button"
                                className={
                                    contentType === "tv"
                                        ? "active"
                                        : ""
                                }
                                onClick={() =>
                                    changeContentType("tv")
                                }
                            >
                                TV Series
                            </button>

                            <button
                                type="button"
                                className={
                                    contentType === "anime"
                                        ? "active"
                                        : ""
                                }
                                onClick={() =>
                                    changeContentType("anime")
                                }
                            >
                                Anime
                            </button>

                        </div>
                    </div>

                    {results.length > 0 && !loading && (
                        <div className="genre-result-summary">
                            <span>
                                {results.length} titles
                            </span>
                        </div>
                    )}

                    {loading ? (
                        <div className="genre-loading">
                            <div className="genre-spinner" />
                            <p>
                                Finding {genreName} titles...
                            </p>
                        </div>
                    ) : error ? (
                        <div className="genre-empty">
                            <div className="genre-empty-icon">
                                !
                            </div>

                            <h3>Something went wrong</h3>

                            <p>{error}</p>

                            <button
                                type="button"
                                onClick={() =>
                                    loadGenreResults(
                                        1,
                                        false,
                                        contentType
                                    )
                                }
                            >
                                Try Again
                            </button>
                        </div>
                    ) : results.length === 0 ? (
                        <div className="genre-empty">
                            <div className="genre-empty-icon">
                                ?
                            </div>

                            <h3>No titles found</h3>

                            <p>
                                We couldn't find anything in this
                                genre yet.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="genre-result-grid">
                                {results.map((item, index) => (
                                    <GenreCard
                                        key={`${item.media_type}-${item.id}-${index}`}
                                        item={item}
                                    />
                                ))}
                            </div>

                            <div className="genre-load-more">
                                <button
                                    type="button"
                                    onClick={handleLoadMore}
                                    disabled={loadingMore}
                                >
                                    {loadingMore
                                        ? "Loading..."
                                        : "Load More ?"}
                                </button>
                            </div>
                        </>
                    )}

                </section>
            </div>
        </main>
    );
}

